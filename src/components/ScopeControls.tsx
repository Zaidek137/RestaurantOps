import { useAppContext } from "../context/AppContext";

export const ScopeControls = () => {
  const {
    assignments,
    activeAssignment,
    setActiveAssignmentId,
    availableBusinesses,
    availableLocations,
    selectedBusinessId,
    setSelectedBusinessId,
    selectedLocationId,
    setSelectedLocationId,
  } = useAppContext();

  return (
    <div className="scope-controls">
      <label>
        <span>Access profile</span>
        <select value={activeAssignment.id} onChange={(event) => setActiveAssignmentId(event.target.value)}>
          {assignments.map((assignment) => (
            <option key={assignment.id} value={assignment.id}>
              {assignment.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Business</span>
        <select
          value={selectedBusinessId}
          onChange={(event) => setSelectedBusinessId(event.target.value)}
          disabled={activeAssignment.businessId !== "all"}
        >
          <option value="all">All businesses</option>
          {availableBusinesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Location</span>
        <select
          value={selectedLocationId}
          onChange={(event) => setSelectedLocationId(event.target.value)}
          disabled={activeAssignment.locationId !== "all"}
        >
          <option value="all">All locations</option>
          {availableLocations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </label>
      <div className="scope-controls__role-badge">{activeAssignment.role.replace("_", " ")}</div>
    </div>
  );
};
