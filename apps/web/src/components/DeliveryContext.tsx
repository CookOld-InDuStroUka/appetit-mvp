import React, { createContext, useContext, useState } from "react";
import DeliveryModal from "./DeliveryModal";
import { Branch } from "./PickupMap";

const BRANCHES: Branch[] = [
  { id: "kazakhstan", name: "КАЗАХСТАН, 70А", coords: [49.963, 82.605] },
  { id: "satpaeva", name: "САТПАЕВА, 8А", coords: [49.967, 82.64] },
  { id: "novatorov", name: "НОВАТОРОВ, 18/2", coords: [49.955, 82.62] },
  { id: "zhybek", name: "ЖИБЕК ЖОЛЫ, 1к8", coords: [49.943, 82.63] },
  { id: "samarskoe", name: "САМАРСКОЕ ШОССЕ, 5/1", coords: [49.935, 82.605] },
  { id: "kabanbay", name: "КАБАНБАЙ БАТЫРА,148", coords: [49.955, 82.65] },
  { id: "nazarbaeva", name: "НАЗАРБАЕВА, 28А", coords: [49.978, 82.65] },
];

type Ctx = {
  mode: "delivery" | "pickup";
  address: string;
  apt: string;
  comment: string;
  branch: string;
  branches: Branch[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setMode: (v: "delivery" | "pickup") => void;
  setAddress: (v: string) => void;
  setApt: (v: string) => void;
  setComment: (v: string) => void;
  setBranch: (id: string) => void;
};

const Ctx = createContext<Ctx | undefined>(undefined);

export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [apt, setApt] = useState("");
  const [comment, setComment] = useState("");
  const [branch, setBranch] = useState(BRANCHES[0].id);
  const [isOpen, setOpen] = useState(false);

  const open = () => setOpen(true);
  const close = () => setOpen(false);

  return (
    <Ctx.Provider
      value={{
        mode,
        address,
        apt,
        comment,
        branch,
        branches: BRANCHES,
        isOpen,
        open,
        close,
        setMode,
        setAddress,
        setApt,
        setComment,
        setBranch,
      }}
    >
      {children}
      {isOpen && <DeliveryModal />}
    </Ctx.Provider>
  );
}

export function useDelivery() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDelivery must be used within DeliveryProvider");
  return ctx;
}

