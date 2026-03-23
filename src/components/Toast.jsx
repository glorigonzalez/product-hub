export default function Toast({ msg, icon }) {
  return (
    <div className="toast show">
      {icon} {msg}
    </div>
  );
}
