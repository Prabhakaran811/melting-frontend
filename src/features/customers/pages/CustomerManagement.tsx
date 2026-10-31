
import { useMemo, useState } from "react";

import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from "../customerApi";

import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../customerTypes";

import CustomerTable from "../components/CustomerTable";
import CustomerForm from "../components/CustomerForm";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../CustomerManagement.css";

const PAGE_SIZE = 10;

type PendingAction =
  | { type: "delete"; customer: Customer }
  | { type: "activate"; customer: Customer }
  | { type: "deactivate"; customer: Customer }
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

export default function CustomerManagement() {
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  // Search and filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination and errors
  const [currentPage, setCurrentPage] = useState(1);
  const [pageError, setPageError] = useState("");

  // Confirmation dialog state
  const [pendingAction, setPendingAction] =
    useState<PendingAction>(null);

  // GET customers
  const {
    data: customers = [],
    isLoading,
    isError,
  } = useGetCustomersQuery();

  // Mutations
  const [createCustomer, { isLoading: creating }] =
    useCreateCustomerMutation();

  const [updateCustomer, { isLoading: updating }] =
    useUpdateCustomerMutation();

  const [deleteCustomer, { isLoading: deleting }] =
    useDeleteCustomerMutation();

  // Search and filters
  const filteredCustomers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        customer.customer_name.toLowerCase().includes(searchValue) ||
        customer.email.toLowerCase().includes(searchValue) ||
        customer.phone_number.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && customer.is_active) ||
        (statusFilter === "inactive" && !customer.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / PAGE_SIZE)
  );

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredCustomers.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [filteredCustomers, currentPage]);

  const startItem =
    filteredCustomers.length === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(
    currentPage * PAGE_SIZE,
    filteredCustomers.length
  );

  // Reset pagination when filters change
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Form handlers
  const openCreateForm = () => {
    setSelectedCustomer(null);
    setPageError("");
    setIsFormOpen(true);
  };

  const openEditForm = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPageError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedCustomer(null);
    setPageError("");
  };

  // Create and update customer
  const handleFormSubmit = async (
    data: CreateCustomerRequest | UpdateCustomerRequest
  ) => {
    setPageError("");

    try {
      if (selectedCustomer) {
        await updateCustomer({
          id: selectedCustomer.id,
          body: data as UpdateCustomerRequest,
        }).unwrap();
      } else {
        await createCustomer(
          data as CreateCustomerRequest
        ).unwrap();

        setCurrentPage(1);
      }

      closeForm();
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    }
  };

  // Open confirmation dialog for delete
  const handleDelete = (customer: Customer) => {
    setPageError("");

    setPendingAction({
      type: "delete",
      customer,
    });
  };

  // Open confirmation dialog for activate/deactivate
  const handleToggleStatus = (customer: Customer) => {
    setPageError("");

    setPendingAction({
      type: customer.is_active ? "deactivate" : "activate",
      customer,
    });
  };

  // Execute confirmed action
  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    const action = pendingAction;

    setPageError("");

    try {
      if (action.type === "delete") {
        await deleteCustomer(action.customer.id).unwrap();

        setCurrentPage((page) =>
          Math.min(
            page,
            Math.max(
              1,
              Math.ceil(
                (filteredCustomers.length - 1) / PAGE_SIZE
              )
            )
          )
        );
      }

      if (action.type === "activate") {
        await updateCustomer({
          id: action.customer.id,
          body: { is_active: true },
        }).unwrap();
      }

      if (action.type === "deactivate") {
        await updateCustomer({
          id: action.customer.id,
          body: { is_active: false },
        }).unwrap();
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
      <div className="customers-state">
        Loading customers...
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="customers-state customers-state-error">
        <h2>Unable to load customers</h2>
        <p>
          Check that the backend is running and that you are signed in.
        </p>
      </div>
    );
  }

  return (
    <div className="customer-management">

      {/* API error */}
      {pageError && (
        <div className="customer-page-error" role="alert">
          {pageError}
        </div>
      )}

      {/* Customer list */}
      <section className="customer-list-card">

        <div className="customer-list-heading">
          <h2>Customer List</h2>

          <p className="muted">
            Showing {startItem}-{endItem} of {filteredCustomers.length}
          </p>
        </div>

        {/* Filters */}
        <div className="customer-filters">

          <input
            type="search"
            placeholder="Search by customer name, email or phone"
            aria-label="Search customers"
            value={search}
            onChange={(event) =>
              handleSearch(event.target.value)
            }
          />

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
            className="btn-primary btn-add-customer"
            onClick={openCreateForm}
          >
            + Add Customer
          </button>

        </div>

        {/* Customer table */}
        <CustomerTable
          customers={paginatedCustomers}
          onEdit={openEditForm}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />

        {/* Pagination */}
        <div className="customer-pagination">

          <span className="pagination-info">
            Showing {startItem}-{endItem} of {filteredCustomers.length} customers
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

      {/* Add / Edit Customer Modal */}
      {isFormOpen && (
        <div
          className="customer-form-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="customer-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-form-title"
          >
            <CustomerForm
              customer={selectedCustomer}
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
            ? "Delete customer?"
            : pendingAction?.type === "deactivate"
              ? "Deactivate customer?"
              : "Activate customer?"
        }
        message={
          pendingAction?.type === "delete"
            ? `Are you sure you want to permanently delete ${pendingAction.customer.customer_name}? This action cannot be undone.`
            : pendingAction?.type === "deactivate"
              ? `Are you sure you want to deactivate ${pendingAction.customer.customer_name}?`
              : `Are you sure you want to activate ${pendingAction?.customer.customer_name}?`
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
        loading={deleting || updating}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />

    </div>
  );
}
