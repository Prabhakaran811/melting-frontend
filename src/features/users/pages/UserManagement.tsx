
import { useMemo, useState } from "react";

import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from "../userApi";

import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
} from "../userTypes";

import UserTable from "../components/UserTable";
import UserForm from "../components/UserForm";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "./UserManagement.css";

const ROLES: UserRole[] = [
  "admin",
  "supervisor",
  "operator",
  "inspector",
];

const PAGE_SIZE = 10;

type PendingAction =
  | { type: "delete"; user: User }
  | { type: "activate"; user: User }
  | { type: "deactivate"; user: User }
  | null;

// Convert API errors into readable strings
const getApiErrorMessage = (error: unknown): string => {
  if (
    typeof error !== "object" ||
    error === null ||
    !("data" in error)
  ) {
    return "Unable to complete the operation. Please try again.";
  }

  const data = (
    error as {
      data?: {
        detail?: unknown;
        message?: string;
      };
    }
  ).data;

  if (!data) {
    return "The server rejected the request.";
  }

  // FastAPI validation errors
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item: unknown) => {
        if (
          typeof item === "object" &&
          item !== null &&
          "msg" in item
        ) {
          return String(item.msg);
        }

        return "Invalid input.";
      })
      .join(", ");
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  return "The server rejected the request.";
};

export default function UserManagement() {
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Search and filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination and errors
  const [currentPage, setCurrentPage] = useState(1);
  const [pageError, setPageError] = useState("");

  // Confirmation dialog state
  const [pendingAction, setPendingAction] =
    useState<PendingAction>(null);

  // GET users
  const {
    data: users = [],
    isLoading,
    isError,
  } = useGetUsersQuery({ skip: 0, limit: 100 });

  // Mutations
  const [createUser, { isLoading: creating }] =
    useCreateUserMutation();

  const [updateUser, { isLoading: updating }] =
    useUpdateUserMutation();

  const [deleteUser, { isLoading: deleting }] =
    useDeleteUserMutation();

  const [activateUser, { isLoading: activating }] =
    useActivateUserMutation();

  const [deactivateUser, { isLoading: deactivating }] =
    useDeactivateUserMutation();

  // Search and filters
  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(searchValue) ||
        user.employee_id.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue);

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "inactive" && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredUsers.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [filteredUsers, currentPage]);

  const startItem =
    filteredUsers.length === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(
    currentPage * PAGE_SIZE,
    filteredUsers.length
  );

  // Reset pagination when filters change
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Form handlers
  const openCreateForm = () => {
    setSelectedUser(null);
    setPageError("");
    setIsFormOpen(true);
  };

  const openEditForm = (user: User) => {
    setSelectedUser(user);
    setPageError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
    setPageError("");
  };

  // Create and update
  const handleFormSubmit = async (
    data: CreateUserRequest | UpdateUserRequest
  ) => {
    setPageError("");

    try {
      if (selectedUser) {
        await updateUser({
          id: selectedUser.id,
          body: data as UpdateUserRequest,
        }).unwrap();
      } else {
        await createUser(
          data as CreateUserRequest
        ).unwrap();

        setCurrentPage(1);
      }

      closeForm();
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    }
  };

  // Open confirmation dialog for delete
  const handleDelete = (user: User) => {
    setPageError("");
    setPendingAction({
      type: "delete",
      user,
    });
  };

  // Open confirmation dialog for activate/deactivate
  const handleToggleStatus = (user: User) => {
    setPageError("");

    setPendingAction({
      type: user.is_active ? "deactivate" : "activate",
      user,
    });
  };

  // Execute confirmed action
  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    const action = pendingAction;

    setPageError("");

    try {
      if (action.type === "delete") {
        await deleteUser(action.user.id).unwrap();

        setCurrentPage((page) =>
          Math.min(
            page,
            Math.max(
              1,
              Math.ceil(
                (filteredUsers.length - 1) / PAGE_SIZE
              )
            )
          )
        );
      }

      if (action.type === "activate") {
        await activateUser(action.user.id).unwrap();
      }

      if (action.type === "deactivate") {
        await deactivateUser(action.user.id).unwrap();
      }

      setPendingAction(null);
    } catch (error) {
      setPageError(getApiErrorMessage(error));
      setPendingAction(null);
    }
  };

  // Cancel confirmation
  const handleCancelAction = () => {
    setPendingAction(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="users-state">
        Loading employees...
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="users-state users-state-error">
        <h2>Unable to load employees</h2>
        <p>
          Check that the backend is running and that you are signed in.
        </p>
      </div>
    );
  }

  return (
    <div className="user-management">

      {/* API error */}
      {pageError && (
        <div className="user-page-error" role="alert">
          {pageError}
        </div>
      )}

      {/* Employee list */}
      <section className="user-list-card">

        <div className="user-list-heading">
          <h2>Employee List</h2>

          <p className="muted">
            Showing {startItem}-{endItem} of {filteredUsers.length}
          </p>
        </div>

        {/* Filters */}
        <div className="user-filters">

          <input
            type="search"
            placeholder="Search by employee ID, name or email"
            aria-label="Search employees"
            value={search}
            onChange={(event) =>
              handleSearch(event.target.value)
            }
          />

          <select
            aria-label="Filter by role"
            value={roleFilter}
            onChange={(event) =>
              handleRoleFilter(event.target.value)
            }
          >
            <option value="all">All roles</option>

            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) =>
              handleStatusFilter(event.target.value)
            }
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="button"
            className="btn-primary btn-add-employee"
            onClick={openCreateForm}
          >
            + Add Employee
          </button>

        </div>

        {/* User table */}
        <UserTable
          users={paginatedUsers}
          onEdit={openEditForm}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />

        {/* Pagination */}
        <div className="user-pagination">

          <span className="pagination-info">
            Showing {startItem}-{endItem} of {filteredUsers.length} employees
          </span>

          <div className="pagination-controls">

            <button
              type="button"
              className="page-button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => page - 1)
              }
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                type="button"
                key={page}
                className={`page-button ${
                  currentPage === page ? "active-page" : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="page-button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => page + 1)
              }
            >
              Next
            </button>

          </div>
        </div>

      </section>

      {/* Add / Edit User Modal */}
      {isFormOpen && (
        <div
          className="user-form-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="user-form-modal"
            role="dialog"
            aria-modal="true"
          >
            <UserForm
              user={selectedUser}
              loading={creating || updating}
              serverError={pageError}
              onSubmit={handleFormSubmit}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}

      {/* Delete / Activate / Deactivate Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(pendingAction)}
        title={
          pendingAction?.type === "delete"
            ? "Delete employee?"
            : pendingAction?.type === "deactivate"
              ? "Deactivate employee?"
              : "Activate employee?"
        }
        message={
          pendingAction?.type === "delete"
            ? `Are you sure you want to permanently delete ${pendingAction.user.full_name} (${pendingAction.user.employee_id})? This action cannot be undone.`
            : pendingAction?.type === "deactivate"
              ? `Are you sure you want to deactivate ${pendingAction.user.full_name}?`
              : `Are you sure you want to activate ${pendingAction?.user.full_name}?`
        }
        confirmText={
          pendingAction?.type === "delete"
            ? "Delete"
            : pendingAction?.type === "deactivate"
              ? "Deactivate"
              : "Activate"
        }
        variant={
          pendingAction?.type === "delete"
            ? "danger"
            : pendingAction?.type === "deactivate"
              ? "warning"
              : "success"
        }
        loading={deleting || activating || deactivating}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />

    </div>
  );
}
