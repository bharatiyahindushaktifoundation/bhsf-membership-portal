import { useState, useEffect, useCallback } from "react";
import { locationService } from "../services";

/**
 * Manages cascading dropdown state for the organizational hierarchy:
 * District -> Assembly -> Mandal -> Village Panchayat.
 * States are loaded once; the rest reload whenever their parent changes.
 */
export function useLocationHierarchy(initial = {}) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [assemblies, setAssemblies] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [panchayats, setPanchayats] = useState([]);

  const [stateId, setStateId] = useState(initial.stateId || "");
  const [districtId, setDistrictId] = useState(initial.districtId || "");
  const [assemblyId, setAssemblyId] = useState(initial.assemblyId || "");
  const [mandalId, setMandalId] = useState(initial.mandalId || "");
  const [panchayatId, setPanchayatId] = useState(initial.panchayatId || "");

  useEffect(() => {
    locationService.list("state").then((res) => setStates(res.data));
  }, []);

  useEffect(() => {
    if (!stateId) {
      setDistricts([]);
      return;
    }
    locationService.list("district", { stateId }).then((res) => setDistricts(res.data));
  }, [stateId]);

  useEffect(() => {
    if (!districtId) {
      setAssemblies([]);
      return;
    }
    locationService.list("assembly", { districtId }).then((res) => setAssemblies(res.data));
  }, [districtId]);

  useEffect(() => {
    if (!assemblyId) {
      setMandals([]);
      return;
    }
    locationService.list("mandal", { assemblyId }).then((res) => setMandals(res.data));
  }, [assemblyId]);

  useEffect(() => {
    if (!mandalId) {
      setPanchayats([]);
      return;
    }
    locationService.list("panchayat", { mandalId }).then((res) => setPanchayats(res.data));
  }, [mandalId]);

  const onStateChange = useCallback((id) => {
    setStateId(id);
    setDistrictId("");
    setAssemblyId("");
    setMandalId("");
    setPanchayatId("");
  }, []);

  const onDistrictChange = useCallback((id) => {
    setDistrictId(id);
    setAssemblyId("");
    setMandalId("");
    setPanchayatId("");
  }, []);

  const onAssemblyChange = useCallback((id) => {
    setAssemblyId(id);
    setMandalId("");
    setPanchayatId("");
  }, []);

  const onMandalChange = useCallback((id) => {
    setMandalId(id);
    setPanchayatId("");
  }, []);

  return {
    states,
    districts,
    assemblies,
    mandals,
    panchayats,
    stateId,
    districtId,
    assemblyId,
    mandalId,
    panchayatId,
    onStateChange,
    onDistrictChange,
    onAssemblyChange,
    onMandalChange,
    setPanchayatId,
  };
}
