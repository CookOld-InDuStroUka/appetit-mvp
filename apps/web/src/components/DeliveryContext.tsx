import React, { createContext, useContext, useEffect, useState } from "react";
import DeliveryModal from "./DeliveryModal";
import { Branch } from "./PickupMap";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

// Fallback филиалы с координатами на случай, если API недоступно
const DEFAULT_BRANCHES: Branch[] = [
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
  entrance: string;
  doorCode: string;
  floor: string;
  comment: string;
  branch: string;
  branches: Branch[];
  history: string[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setMode: (v: "delivery" | "pickup") => void;
  setAddress: (v: string) => void;
  setApt: (v: string) => void;
   setEntrance: (v: string) => void;
   setDoorCode: (v: string) => void;
   setFloor: (v: string) => void;
  setComment: (v: string) => void;
  setBranch: (id: string) => void;
  addHistory: (addr: string) => void;
  removeHistory: (addr: string) => void;
};

const Ctx = createContext<Ctx | undefined>(undefined);

export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [apt, setApt] = useState("");
  const [entrance, setEntrance] = useState("");
  const [doorCode, setDoorCode] = useState("");
  const [floor, setFloor] = useState("");
  const [comment, setComment] = useState("");
  const [branches, setBranches] = useState<Branch[]>(DEFAULT_BRANCHES);
  const [branch, setBranch] = useState(DEFAULT_BRANCHES[0].id);
  const [isOpen, setOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("deliveryAddresses");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/branches`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          const mapped: Branch[] = data.map((b: any) => {
            const fallback = DEFAULT_BRANCHES.find((fb) => fb.id === b.id);
            return {
              id: b.id,
              name: b.address || b.name,
              coords: fallback?.coords || [0, 0],
            };
          });
          setBranches(mapped);
          setBranch(mapped[0].id);
        }
      })
      .catch(() => {
        /* fallback already set */
      });
  }, []);

  const open = () => setOpen(true);
  const close = () => setOpen(false);

  const addHistory = (addr: string) => {
    if (!addr) return;
    setHistory((prev) => {
      const next = [addr, ...prev.filter((a) => a !== addr)].slice(0, 5);
      localStorage.setItem("deliveryAddresses", JSON.stringify(next));
      return next;
    });
  };

  const removeHistory = (addr: string) => {
    setHistory((prev) => {
      const next = prev.filter((a) => a !== addr);
      localStorage.setItem("deliveryAddresses", JSON.stringify(next));
      return next;
    });
  };

  return (
    <Ctx.Provider
      value={{
        mode,
        address,
        apt,
        entrance,
        doorCode,
        floor,
        comment,
        branch,
        branches,
        history,
        isOpen,
        open,
        close,
        setMode,
        setAddress,
        setApt,
        setEntrance,
        setDoorCode,
        setFloor,
        setComment,
        setBranch,
        addHistory,
        removeHistory,
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

