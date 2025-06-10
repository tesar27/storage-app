"use client";
import React from "react";
import AppSearch from "./app-search";

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
);

const NewHeader = () => {
  return (
    <div className="flex items-center justify-end p-2">
      <div className="p-2">
        <AppSearch />
      </div>
    </div>
  );
};

export default NewHeader;
