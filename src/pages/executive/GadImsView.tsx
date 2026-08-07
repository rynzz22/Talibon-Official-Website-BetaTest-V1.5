import React from "react";
import GadImsSystem from "../../components/GadImsSystem";

interface GadImsViewProps {
  data: any;
}

export default function GadImsView({ data }: GadImsViewProps) {
  return <GadImsSystem data={data} />;
}
