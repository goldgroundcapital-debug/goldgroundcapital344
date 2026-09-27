export type Plan = {
  id: string;
  name: string;
  machine: string;
  tier: string;
  min: number;
  max: number;
  dailyRate: number;
  durationDays: number;
  image: string;
  summary: string;
  perks: string[];
  highlighted?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "drill",
    name: "Drill Rig",
    machine: "CAT Rotary Drill Rig",
    tier: "Starter",
    min: 50,
    max: 99,
    dailyRate: 10,
    durationDays: 14,
    image: "/machines/drill-rig.jpg",
    summary: "Back a rotary drill sinking blast holes ahead of the production face.",
    perks: ["Daily payouts", "Withdraw at maturity", "Email support"],
  },
  {
    id: "grader",
    name: "Motor Grader",
    machine: "CAT Motor Grader",
    tier: "Foundation",
    min: 100,
    max: 149,
    dailyRate: 15,
    durationDays: 28,
    image: "/machines/grader.jpg",
    summary: "Fund a motor grader keeping haul roads smooth and safe across the pit.",
    perks: ["Daily payouts", "Withdraw at maturity", "Email support"],
  },
  {
    id: "bulldozer",
    name: "Bulldozer",
    machine: "CAT Heavy-Duty Bulldozer",
    tier: "Builder",
    min: 150,
    max: 199,
    dailyRate: 20,
    durationDays: 42,
    image: "/machines/bulldozer.jpg",
    summary: "Stake a pit-floor bulldozer clearing overburden across active extraction sites.",
    perks: ["Daily payouts", "2% referral bonus", "Email support"],
  },
  {
    id: "wheel-loader",
    name: "Wheel Loader",
    machine: "CAT Wheel Loader",
    tier: "Core",
    min: 200,
    max: 249,
    dailyRate: 25,
    durationDays: 56,
    image: "/machines/wheel-loader.jpg",
    summary: "Co-own a wheel loader scooping ore into haul trucks at the loading face.",
    perks: ["Daily payouts", "3% referral bonus", "Priority support"],
  },
  {
    id: "articulated-truck",
    name: "Articulated Truck",
    machine: "CAT Articulated Hauler",
    tier: "Growth",
    min: 250,
    max: 299,
    dailyRate: 30,
    durationDays: 70,
    image: "/machines/articulated-truck.jpg",
    summary: "Back an articulated hauler carrying ore over rough in-pit terrain.",
    perks: ["Daily payouts", "4% referral bonus", "Priority support"],
    highlighted: true,
  },
  {
    id: "haul-truck",
    name: "Haul Truck",
    machine: "CAT Rigid Haul Truck",
    tier: "Heavy",
    min: 300,
    max: 349,
    dailyRate: 35,
    durationDays: 84,
    image: "/machines/haul-truck.jpg",
    summary: "Own a stake in a rigid haul truck cycling ore from pit to processing plant.",
    perks: ["Daily payouts", "5% referral bonus", "Monthly site report"],
  },
  {
    id: "excavator",
    name: "Hydraulic Excavator",
    machine: "CAT Hydraulic Excavator",
    tier: "Premier",
    min: 350,
    max: 399,
    dailyRate: 40,
    durationDays: 98,
    image: "/machines/excavator.jpg",
    summary: "Stake a hydraulic excavator loading ore at the production face.",
    perks: ["Daily payouts", "7% referral bonus", "Quarterly briefings"],
  },
  {
    id: "ore-hauler",
    name: "Ore Hauler",
    machine: "Ultra-Class Ore Hauler",
    tier: "Vault",
    min: 400,
    max: 9999,
    dailyRate: 45,
    durationDays: 112,
    image: "/machines/ore-hauler.jpg",
    summary: "Anchor a stake in an ultra-class ore hauler — the flagship of the fleet.",
    perks: ["Daily payouts", "10% referral bonus", "Custom strategy review", "Site-visit invitation"],
  },
];

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(n);
}
