import { useAppContext } from "../context/AppContext";
import { FuturisticSelect } from "./FuturisticSelect";

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

  const activeAssignmentOptions = assignments.map(a => ({ value: a.id, label: a.label }));
  
  const businessOptions = [
    { value: "all", label: "All businesses" },
    ...availableBusinesses.map(b => ({ value: b.id, label: b.name }))
  ];

  const locationOptions = [
    { value: "all", label: "All locations" },
    ...availableLocations.map(l => ({ value: l.id, label: l.name }))
  ];

  return (
    <div className="scope-controls">
      <FuturisticSelect
        label="Access profile"
        options={activeAssignmentOptions}
        value={activeAssignment.id}
        onChange={setActiveAssignmentId}
      />
      <FuturisticSelect
        label="Business"
        options={businessOptions}
        value={selectedBusinessId}
        onChange={setSelectedBusinessId}
        disabled={activeAssignment.businessId !== "all"}
      />
      <FuturisticSelect
        label="Location"
        options={locationOptions}
        value={selectedLocationId}
        onChange={setSelectedLocationId}
        disabled={activeAssignment.locationId !== "all"}
      />
      
      <div className="scope-controls__role-group">
        <span className="futuristic-select__label">Effective Role</span>
        <div className="scope-controls__role-badge">{activeAssignment.role.replace("_", " ")}</div>
      </div>
    </div>
  );
};
