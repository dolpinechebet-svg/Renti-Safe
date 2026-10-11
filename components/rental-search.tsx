"use client";

import { useState } from "react";
import { campuses, towns } from "@/lib/content";

export function RentalSearch({
  town = "",
  area = "",
  campus = "",
  customCampus = "",
  bedrooms = "",
  maxRent = "",
}: {
  town?: string;
  area?: string;
  campus?: string;
  customCampus?: string;
  bedrooms?: string;
  maxRent?: string;
}) {
  const campusOptions: string[] = [...new Set(campuses.map((item) => item.name))];
  const isCustomCampus = campus === "Other" || Boolean(customCampus) || (Boolean(campus) && !campusOptions.includes(campus));
  const [showCustomCampus, setShowCustomCampus] = useState(isCustomCampus);
  const [selectedCampus, setSelectedCampus] = useState(isCustomCampus ? "Other" : campus);
  return <form action="/rentals" method="get" className="form-card stack">
    <div className="grid2">
      <div className="field"><label htmlFor="town">Town</label><select id="town" name="town" defaultValue={town}><option value="">All towns</option>{[...towns].sort((a, b) => a.name.localeCompare(b.name)).map((item) => <option key={item.slug} value={item.name}>{item.name}</option>)}</select></div>
      <div className="field"><label htmlFor="area">Estate or neighbourhood</label><input id="area" name="area" defaultValue={area} placeholder="Kilimani, Kesses, Nyali" /></div>
      <div className="field">
        <label htmlFor="campus">Near a university</label>
        <select id="campus" name="campus" value={selectedCampus} onChange={(event) => {
          setSelectedCampus(event.currentTarget.value);
          setShowCustomCampus(event.currentTarget.value === "Other");
        }}>
          <option value="">Any university area</option>
          {campusOptions.map((name) => <option key={name} value={name}>{name}</option>)}
          <option value="Other">Other</option>
        </select>
        <button type="button" className="btn btn-outline" aria-expanded={showCustomCampus} onClick={() => {
          setSelectedCampus("Other");
          setShowCustomCampus((visible) => !visible);
        }}>Enter a university</button>
        {showCustomCampus && <div className="field">
          <label htmlFor="campus-search">University name</label>
          <input id="campus-search" name="campus_search" defaultValue={customCampus || (isCustomCampus && campus !== "Other" ? campus : "")} placeholder="Type a university name" disabled={!showCustomCampus} />
        </div>}
      </div>
      <div className="field"><label htmlFor="bedrooms">Property type</label><select id="bedrooms" name="bedrooms" defaultValue={bedrooms}><option value="">Any size</option><option value="0">Bedsitter</option><option value="1">One bedroom</option><option value="2">Two bedrooms</option><option value="3">Three bedrooms</option></select></div>
      <div className="field"><label htmlFor="maxRent">Maximum monthly rent in KES</label><input id="maxRent" name="maxRent" type="number" min="1" step="500" defaultValue={maxRent} placeholder="For example 15000" /></div>
    </div>
    <button className="btn">Find available homes</button>
  </form>;
}
