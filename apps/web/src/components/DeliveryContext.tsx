import React, { createContext, useContext, useEffect, useState } from "react";
import DeliveryModal from "./DeliveryModal";
import { Branch } from "./PickupMap";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://appetit.duckdns.org/api/v1";

// Fallback филиалы с координатами на случай, если API недоступно
const DEFAULT_BRANCHES: Branch[] = [
  {
    id: "kazakhstan",
    name: "ул. Казахстан, 70А",
    coords: [49.948655, 82.629438],
    hours: "12:00 – 23:00",
  },
  {
    id: "satpaeva",
    name: "пр. Каныша Сатпаева, 8А",
    coords: [49.899568, 82.618955],
    hours: "круглосуточно",
  },
  {
    id: "novatorov",
    name: "ул. Новаторов, 18/2",
    coords: [49.955147, 82.647584],
    hours: "круглосуточно",
  },
  {
    id: "zhybek",
    name: "ул. Жибек Жолы, 1 к8",
    coords: [49.928821, 82.612936],
    hours: "11:00 – 02:00",
  },
  {
    id: "samarskoe",
    name: "Самарское шоссе, 5/1",
    coords: [49.898645, 82.634676],
    hours: "10:00 – 00:00",
  },
  {
    id: "kabanbay",
    name: "ул. Кабанбай батыра, 148",
    coords: [49.954, 82.620],
    hours: "09:00 – 22:00",
  },
  {
    id: "nazarbaeva",
    name: "пр. Нурсултана Назарбаева, 28А",
    coords: [49.962379, 82.602893],
    hours: "10:00 – 02:00",
  },
];

type Ctx = {
  mode: "delivery" | "pickup";
  address: string;
  apt: string;
  entrance: string;
  floor: string;
  comment: string;
  branch: string;
  pickupTime: string;
  branches: Branch[];
  history: string[];
  outOfZone: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setMode: (v: "delivery" | "pickup") => void;
  setAddress: (v: string) => void;
  setApt: (v: string) => void;
   setEntrance: (v: string) => void;
   setFloor: (v: string) => void;
  setComment: (v: string) => void;
  setBranch: (id: string) => void;
  setPickupTime: (v: string) => void;
  addHistory: (addr: string) => void;
  removeHistory: (addr: string) => void;
  setOutOfZone: (v: boolean) => void;
};

const Ctx = createContext<Ctx | undefined>(undefined);

export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [apt, setApt] = useState("");
  const [entrance, setEntrance] = useState("");
  const [floor, setFloor] = useState("");
  const [comment, setComment] = useState("");
  const [branches, setBranches] = useState<Branch[]>(DEFAULT_BRANCHES);
  const [branch, setBranch] = useState(DEFAULT_BRANCHES[0].id);
  const [pickupTime, setPickupTime] = useState("");
  const [isOpen, setOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [outOfZone, setOutOfZone] = useState(false);

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
              hours: b.hours || fallback?.hours,
            };
          });
          setBranches(mapped);
          setBranch((prev) => prev || mapped[0].id);
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
        floor,
        comment,
      branch,
      pickupTime,
      branches,
      history,
      outOfZone,
      isOpen,
      open,
      close,
      setMode,
      setAddress,
        setApt,
        setEntrance,
        setFloor,
        setComment,
      setBranch,
      setPickupTime,
      addHistory,
      removeHistory,
      setOutOfZone,
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

