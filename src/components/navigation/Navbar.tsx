import Breadcrumb from "./Breadcrumb";
import ShiftClock from "./ShiftClock";
import UserMenu from "./UserMenu";
import Icon from "../common/Icon";

type Props = {
  onToggle: () => void;
};

export default function Navbar({ onToggle }: Props) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="icon-btn"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <Icon name="panel" />
        </button>
        <Breadcrumb />
      </div>

      <div className="navbar-right">
        <ShiftClock />
        <button className="icon-btn" aria-label="Alerts, 2 new" title="Alerts">
          <Icon name="bell" />
          <span className="badge">2</span>
        </button>
        <UserMenu />
      </div>
    </header>
  );
}