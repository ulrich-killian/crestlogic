/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  CheckCircle,
  RotateCw,
  ChevronRight,
  Copy,
  Check,
  Printer,
  RefreshCw,
  Zap,
  Package,
  Ship,
  Plane,
  Truck,
  Warehouse,
  MessageSquare,
  Users,
  Compass,
  ArrowRight,
  Send,
  HelpCircle,
  FileText,
  Clock,
  ExternalLink,
  Search,
  ChevronUp,
  Lock,
  Menu,
  X,
  Plus,
  Trash2,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  Layers,
  Info,
  ShieldCheck,
  Mail,
  Smartphone,
  CheckCircle2,
  Database,
  Sliders,
  BellRing,
  Sun,
  Moon,
  Star,
  StarHalf,
  Leaf,
  Target,
} from "lucide-react";
import Header from "./components/Header";
import { ShipmentFormData, AiInsightsResponse, ManifestItem } from "./types";
import {
  INITIAL_SHIPMENT_DATA,
  generateTrackingId,
  SAMPLE_INVOICES,
  getLatLng,
  getGeodesicDistance,
} from "./utils";
import { motion, AnimatePresence } from "motion/react";
import TrackingMockMap from "./components/TrackingMockMap";

interface AppProps {
  forcePublic?: boolean;
  forceAdminDashboard?: boolean;
  forceAdminLogin?: boolean;
  onLoginSuccess?: () => void;
  onLogout?: () => void;
}

export default function App({
  forcePublic = false,
  forceAdminDashboard = false,
  forceAdminLogin = false,
  onLoginSuccess,
  onLogout,
}: AppProps = {}) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const [activeTab, setActiveTab] = useState<
    "home" | "about" | "services" | "contact" | "track"
  >("home");
  const [isAdminMode, setIsAdminMode] = useState(
    forceAdminLogin || forceAdminDashboard
  );
  const [adminSection, setAdminSection] = useState<
    "register" | "registry" | "simulator"
  >("register");

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(forceAdminDashboard);
  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [serverShipments, setServerShipments] = useState<any[]>([]);
  const [shipmentToDelete, setShipmentToDelete] = useState<any | null>(null);
  const [serverSearchQuery, setServerSearchQuery] = useState("");
  const [sortField, setSortField] = useState<
    "date-desc" | "date-asc" | "weight-desc" | "weight-asc"
  >("date-desc");

  const [adminFormData, setAdminFormData] = useState<ShipmentFormData>({
    orderId: generateTrackingId(),
    customerName: "",
    destination: "",
    items: [{ id: "item-1", name: "", qty: 1 }],
    weight: 45,
    dimensions: "60x60x82 cm",
    fragile: false,
    uploadedFiles: [],
  });

  const [domesticFormData, setDomesticFormData] = useState({
    shipDate: new Date().toISOString().split("T")[0],
    sender: "",
    senderAddress: "",
    senderPhone: "",
    cmNumber: "",
    fund: "",
    org: "",
    acct: "",

    recipientAddressType: "Business" as "Business" | "Residential",
    recipientTo: "",
    recipientCompany: "",
    recipientAddress: "",
    recipientCityStateZip: "",
    recipientPhone: "",

    paymentPersonal: false,
    paymentBusiness: false,
    paymentBillShipper: false,
    paymentBill3rdParty: false,
    paymentThirdPartyAcct: "",
    paymentBillRecipient: false,
    paymentRecipientAcct: "",

    packageWeight: "15",
    weightUnit: "kg" as "kg" | "lbs",
    paymentMethod: "Credit Card" as
      | "Apple Pay"
      | "Credit Card"
      | "Cash App"
      | "PayPal"
      | "Other methods"
      | string,

    uspsPriority: false,
    uspsExpress: false,
    uspsPackageServices: false,

    fedexServiceTier: "" as
      | "PriorityOvernight"
      | "StandardOvernight"
      | "FedEx2Day"
      | "ExpressSaver"
      | "Ground"
      | "",
    fedexPackaging: "other" as "letter" | "pak" | "box" | "other",

    surchargeDirectSignature: false,
    surchargeSaturdayDelivery: false,
    surchargeHolidayDelivery: false,

    insuranceRequired: false,
    declaredValue: "",

    processedBy: "Agent #2026",
    processingDate: new Date().toISOString().split("T")[0],
  });

  const [lastCreatedDomesticWaybill, setLastCreatedDomesticWaybill] = useState<
    any | null
  >(null);

  const aiRouteAnalysis = useMemo(() => {
    const originStr = domesticFormData.senderAddress?.trim();
    const destinationStr = `${domesticFormData.recipientAddress || ""}, ${
      domesticFormData.recipientCityStateZip || ""
    }`.trim();

    if (!originStr || !destinationStr) {
      return null;
    }

    const defaultOrigin = { lat: 37.7749, lng: -122.4194 }; // SF
    const defaultDest = { lat: 40.7128, lng: -74.006 }; // NY

    const startLoc = getLatLng(originStr, defaultOrigin);
    const endLoc = getLatLng(destinationStr, defaultDest);

    const distanceKm = Math.round(getGeodesicDistance(startLoc, endLoc));
    const distanceMiles = Math.round(distanceKm * 0.621371);

    const travellingHours = Number((distanceKm / 80).toFixed(1));
    const travellingDays = Math.max(
      1,
      Number((travellingHours / 8).toFixed(1))
    );

    let corridorName = "Overland Regional Lanes";
    if (
      originStr.toLowerCase().includes("canada") ||
      destinationStr.toLowerCase().includes("canada")
    ) {
      corridorName = "Trans-Border Northern Expansion Route";
    } else if (
      originStr.toLowerCase().includes("mexic") ||
      destinationStr.toLowerCase().includes("mexic")
    ) {
      corridorName = "Pan-American Southern Tier Corridor";
    } else if (distanceKm < 800) {
      corridorName = "Short-haul Regional Courier Lane";
    } else if (distanceKm > 3000) {
      corridorName = "Transcontinental Interstate Express Highway";
    }

    return {
      distanceKm,
      distanceMiles,
      travellingHours,
      travellingDays,
      corridorName,
      startLoc,
      endLoc,
    };
  }, [
    domesticFormData.senderAddress,
    domesticFormData.recipientAddress,
    domesticFormData.recipientCityStateZip,
  ]);
  const [domesticMessageDraft, setDomesticMessageDraft] = useState("");
  const [dispatchContactTarget, setDispatchContactTarget] = useState("");
  const [dispatchChannel, setDispatchChannel] = useState<
    "sms" | "email" | "whatsapp"
  >("whatsapp");
  const [dispatchStatusMsg, setDispatchStatusMsg] = useState<string | null>(
    null
  );

  const [dragActive, setDragActive] = useState(false);
  const [parsingLogs, setParsingLogs] = useState<string | null>(null);

  const [adminInsights, setAdminInsights] = useState<AiInsightsResponse | null>(
    null
  );
  const [isAdminAnalyzing, setIsAdminAnalyzing] = useState(false);
  const [adminAnalysisError, setAdminAnalysisError] = useState<string | null>(
    null
  );

  const [activeWaybill, setActiveWaybill] = useState<any | null>(null);
  const [editingShipment, setEditingShipment] = useState<any | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [liveOriginInput, setLiveOriginInput] = useState("");
  const [liveDestinationInput, setLiveDestinationInput] = useState("");
  const [liveCheckpointInput, setLiveCheckpointInput] = useState("");
  const [liveHoursDriven, setLiveHoursDriven] = useState<number>(0);
  const [liveDistanceCovered, setLiveDistanceCovered] = useState<number>(0);
  const [isUpdatingWaybill, setIsUpdatingWaybill] = useState(false);

  const adminTravelDistance = useMemo(() => {
    if (!liveOriginInput || !liveDestinationInput) return 0;
    const defaultOrigin = { lat: 4.0511, lng: 9.7679 }; // Douala
    const defaultDest = { lat: 3.848, lng: 11.5021 }; // Yaounde
    const startLoc = getLatLng(liveOriginInput, defaultOrigin);
    const endLoc = getLatLng(liveDestinationInput, defaultDest);
    return Math.round(getGeodesicDistance(startLoc, endLoc));
  }, [liveOriginInput, liveDestinationInput]);

  const [simulatedNotifications, setSimulatedNotifications] = useState<
    Array<{
      type: "whatsapp" | "sms" | "email";
      title: string;
      text: string;
      sender: string;
      time: string;
    }>
  >([]);
  const [isAlertSending, setIsAlertSending] = useState(false);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState<string | null>(null);

  const [publicSearchQuery, setPublicSearchQuery] = useState("");
  const [publicFoundShipment, setPublicFoundShipment] = useState<any | null>(
    null
  );
  const [publicSearchError, setPublicSearchError] = useState<string | null>(
    null
  );
  const [publicSearching, setPublicSearching] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [showHandoff, setShowHandoff] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: "user" | "bot"; text: string }>
  >([
    {
      sender: "bot",
      text: "Welcome to Crest Logistics Help Terminal. I am Crest AI Dispatch Agent. How can I guide your waybill lookup or routing today?",
    },
  ]);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const [timeStr, setTimeStr] = useState("2026-05-22 17:00:00 UTC");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toISOString().replace("T", " ").replace(/\..+/, "") + " UTC"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchShipmentsDb = async () => {
    try {
      const res = await fetch("/api/shipments");
      if (res.ok) {
        const data = await res.json();
        setServerShipments(data);
      } else {
        const defaults = ["CR-385901-LT", "CR-992104-LT"];
        const loaded: any[] = [];
        for (const id of defaults) {
          try {
            const sRes = await fetch(`/api/shipments/${id}`);
            if (sRes.ok) {
              const sData = await sRes.json();
              loaded.push(sData);
            }
          } catch (e) {
            console.error(e);
          }
        }
        setServerShipments(loaded);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchShipmentsDb();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const trackingFromUrl = searchParams.get("track");
    if (trackingFromUrl) {
      setPublicSearchQuery(trackingFromUrl);
      setActiveTab("track");
      handlePublicTrackSearch(null, trackingFromUrl);
    }
  }, []);

  useEffect(() => {
    const focusedWaybill = activeWaybill || lastCreatedDomesticWaybill;
    if (focusedWaybill) {
      setLiveOriginInput(focusedWaybill.origin || "");
      setLiveDestinationInput(focusedWaybill.destination || "");
      setLiveCheckpointInput(focusedWaybill.transitCheckpoint || "");
      setLiveHoursDriven(focusedWaybill.hoursDriven || 0);
      setLiveDistanceCovered(focusedWaybill.distanceCovered || 0);
    }
  }, [activeWaybill, lastCreatedDomesticWaybill]);

  useEffect(() => {
    if (!publicFoundShipment || activeTab !== "track") return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/shipments/${publicFoundShipment.orderId}`
        );
        if (response.ok) {
          const data = await response.json();

          if (
            data.origin !== publicFoundShipment.origin ||
            data.destination !== publicFoundShipment.destination ||
            data.status !== publicFoundShipment.status ||
            JSON.stringify(data.history) !==
              JSON.stringify(publicFoundShipment.history)
          ) {
            setPublicFoundShipment(data);
          }
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [publicFoundShipment?.orderId, activeTab]);

  const navigateToSegment = (
    sectionId: "home" | "about" | "services" | "contact" | "track"
  ) => {
    setIsAdminMode(false);
    setActiveTab(sectionId);
  };

  const handlePublicTrackSearch = async (
    e: React.FormEvent | null,
    specificCode?: string
  ) => {
    if (e) e.preventDefault();
    const code = (specificCode || publicSearchQuery).trim().toUpperCase();
    if (!code) return;

    setPublicSearching(true);
    setPublicSearchError(null);
    setPublicFoundShipment(null);

    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const response = await fetch(`/api/shipments/${code}`);
      if (!response.ok) {
        throw new Error(
          `Tracking waybill ID ${code} is not registered in our core database indexes.`
        );
      }
      const data = await response.json();
      setPublicFoundShipment(data);
    } catch (err: any) {
      setPublicSearchError(err.message || "Unable to retrieve package data.");
    } finally {
      setPublicSearching(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername.trim() === "admin" && adminPassword === "admin2026") {
      if (typeof document !== "undefined") {
        document.cookie =
          "admin_token=authenticated_operator; path=/; max-age=86400";
      }
      setIsAdminLoggedIn(true);
      setAuthError(null);
      setAdminPassword("");
      fetchShipmentsDb();
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      setAuthError(
        "Authorized Personnel Only: Incorrect Operator credentials."
      );
    }
  };

  const handleSimulateInvoiceOcr = (fileName: string) => {
    setParsingLogs(`Running OCR on ${fileName}...`);

    const templateKey = Object.keys(SAMPLE_INVOICES).find(
      (k) =>
        fileName.toLowerCase().includes(k.substring(0, 10)) ||
        k.toLowerCase().includes(fileName.toLowerCase())
    );

    setTimeout(() => {
      setParsingLogs("Structuring item fields...");
      setTimeout(() => {
        if (templateKey && SAMPLE_INVOICES[templateKey]) {
          const sample = SAMPLE_INVOICES[templateKey];
          setAdminFormData({
            ...adminFormData,
            customerName: sample.customerName,
            destination: sample.destination,
            items: sample.items,
            weight: sample.weight,
            dimensions: sample.dimensions,
            fragile: sample.fragile,
            uploadedFiles: [fileName],
          });
          setParsingLogs(
            `OCR Successful: Loaded ${sample.items.length} cargo rows cleanly.`
          );
        } else {
          const genericItems = [
            { id: "parsed-1", name: `Premium Spares (${fileName})`, qty: 25 },
            {
              id: "parsed-2",
              name: "High-Tensile Protective Structural Wraps",
              qty: 2,
            },
          ];
          setAdminFormData({
            ...adminFormData,
            customerName: "Global Ingress Partner Ltd",
            destination: "Boulevard de la Liberté, Douala, Cameroon",
            items: genericItems,
            weight: 125,
            dimensions: "80x80x110 cm",
            fragile: true,
            uploadedFiles: [fileName],
          });
          setParsingLogs(
            "Industrial structural invoice parsed. Custom manifest generated."
          );
        }
        setTimeout(() => setParsingLogs(null), 3500);
      }, 1000);
    }, 1200);
  };

  const handleAddCargoRow = () => {
    const nextId = `item-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 5)}`;
    setAdminFormData({
      ...adminFormData,
      items: [...adminFormData.items, { id: nextId, name: "", qty: 1 }],
    });
  };

  const handleUpdateCargoItemName = (id: string, name: string) => {
    const updated = adminFormData.items.map((item) =>
      item.id === id ? { ...item, name } : item
    );
    setAdminFormData({ ...adminFormData, items: updated });
  };

  const handleUpdateCargoItemQty = (id: string, qty: number) => {
    const updated = adminFormData.items.map((item) =>
      item.id === id ? { ...item, qty: Math.max(1, qty) } : item
    );
    setAdminFormData({ ...adminFormData, items: updated });
  };

  const handleRemoveCargoRow = (id: string) => {
    if (adminFormData.items.length <= 1) return;
    setAdminFormData({
      ...adminFormData,
      items: adminFormData.items.filter((item) => item.id !== id),
    });
  };

  const handleTriggerAiOptimization = async () => {
    if (!adminFormData.customerName) {
      setAdminAnalysisError(
        "Please provide a consignee name prior to invoking the AI Agent."
      );
      return;
    }
    setIsAdminAnalyzing(true);
    setAdminAnalysisError(null);
    setAdminInsights(null);

    try {
      const response = await fetch("/api/logistics-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminFormData),
      });
      if (!response.ok) {
        throw new Error("Logistics route returned non-200 state");
      }
      const data: AiInsightsResponse = await response.json();
      setAdminInsights(data);
    } catch (e: any) {
      setAdminAnalysisError(
        "Cognitive server delayed. Falling back to local heuristic modeling."
      );
    } finally {
      setIsAdminAnalyzing(false);
    }
  };

  const handleRegisterShipmentTicket = async () => {
    if (!adminFormData.customerName || !adminFormData.destination) {
      setAdminAnalysisError(
        "Cannot issue waybill ticket: Consignee name and destination terminal are strictly required."
      );
      return;
    }

    try {
      const response = await fetch("/api/register-shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: adminFormData,
          insights: adminInsights,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post registered shipment.");
      }

      const resData = await response.json();
      const finalShipment = resData.shipment;

      setServerShipments((prev) => {
        const filtered = prev.filter(
          (s) => s.orderId !== finalShipment.orderId
        );
        return [finalShipment, ...filtered];
      });

      setActiveWaybill(finalShipment);
      setAdminSection("simulator");

      const link = `${window.location.origin}/?track=${finalShipment.orderId}`;
      setSimulatedNotifications([]);

      setAdminFormData({
        orderId: generateTrackingId(),
        customerName: "",
        destination: "",
        items: [{ id: "item-1", name: "", qty: 1 }],
        weight: 45,
        dimensions: "60x60x82 cm",
        fragile: false,
        uploadedFiles: [],
      });
      setAdminInsights(null);
    } catch (e) {
      console.error(e);
      setAdminAnalysisError(
        "Registry error: Server database connection could not be committed."
      );
    }
  };

  const handleRegisterDomesticWaybill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !domesticFormData.recipientTo ||
      !domesticFormData.recipientAddress ||
      !domesticFormData.recipientCityStateZip
    ) {
      setAdminAnalysisError(
        "Cannot issue waybill ticket: Recipient's name, Address, and City/State/Zip are strictly required."
      );
      return;
    }
    if (!domesticFormData.sender) {
      setAdminAnalysisError(
        "Cannot issue waybill ticket: Sender name is strictly required."
      );
      return;
    }

    const uniqueId = `CR-${Math.floor(200000 + Math.random() * 700000)}-US`;

    const dynamicInsights = {
      suggestedCarrier: domesticFormData.fedexServiceTier
        ? `FedEx ${domesticFormData.fedexServiceTier}`
        : "U.S. Postal Service",
      predictedTransitDays:
        domesticFormData.fedexServiceTier === "PriorityOvernight" ||
        domesticFormData.fedexServiceTier === "StandardOvernight"
          ? "1-2 Days"
          : "2-3 Days",
      riskAssessment: "LOW" as const,
      directives: [
        `Domestic package tracking routing successfully assigned standard protocol.`,
        `Deliver via chosen: ${
          domesticFormData.fedexServiceTier
            ? "FedEx Delivery"
            : "U.S. Postal Service"
        }.`,
      ],
      buyerDispatchScript: `[Crest Dispatch] Waybill created & registered!\nTracking Code: ${uniqueId}\nSender: ${domesticFormData.sender}\nRecipient: ${domesticFormData.recipientTo}\nDestination: ${domesticFormData.recipientAddress}, ${domesticFormData.recipientCityStateZip}\nTrack online: ${window.location.origin}/?track=${uniqueId}`,
    };

    const finalPayload = {
      formData: {
        orderId: uniqueId,
        customerName: domesticFormData.recipientTo,
        origin: domesticFormData.senderAddress || "California, USA",
        destination: `${domesticFormData.recipientAddress}, ${domesticFormData.recipientCityStateZip}`,
        items: [
          {
            id: `dom-item-1`,
            name: domesticFormData.fedexServiceTier
              ? `FedEx ${domesticFormData.fedexServiceTier} Shipment`
              : "USPS Parcel",
            qty: 1,
          },
        ],
        weight: parseFloat(domesticFormData.packageWeight) || 15,
        dimensions: "30x30x30 cm",
        fragile: domesticFormData.surchargeDirectSignature,
        uploadedFiles: [],
        packageWeight: parseFloat(domesticFormData.packageWeight) || 15,
        weightUnit: domesticFormData.weightUnit,
        paymentMethod: domesticFormData.paymentMethod,
        domesticInfo: domesticFormData,
      },
      insights: dynamicInsights,
    };

    try {
      setIsAdminAnalyzing(true);
      setAdminAnalysisError(null);

      const response = await fetch("/api/register-shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to post domestic shipment.");
      }

      const resData = await response.json();
      const finalShipment = resData.shipment;

      setServerShipments((prev) => {
        const filtered = prev.filter(
          (s) => s.orderId !== finalShipment.orderId
        );
        return [finalShipment, ...filtered];
      });

      setActiveWaybill(finalShipment);
      setLastCreatedDomesticWaybill(finalShipment);

      const targetPhone =
        domesticFormData.recipientPhone ||
        domesticFormData.senderPhone ||
        "555-019-2834";
      setDispatchContactTarget(targetPhone);

      const link = `${window.location.origin}/?track=${finalShipment.orderId}`;
      setDomesticMessageDraft(
        `[Crest Dispatch] Standard Domestic Shipment Registered!\n` +
          `Tracking ID: ${finalShipment.orderId}\n` +
          `Recipient: ${domesticFormData.recipientTo}\n` +
          `Deliver Address: ${domesticFormData.recipientAddress}, ${domesticFormData.recipientCityStateZip}\n` +
          `Delivery Link: ${link}`
      );

      setDispatchStatusMsg(null);
    } catch (err: any) {
      console.error(err);
      setAdminAnalysisError(
        "Registry error: Server database connection could not be committed."
      );
    } finally {
      setIsAdminAnalyzing(false);
    }
  };

  const handleUpdateWaybillHubs = async () => {
    const focusedWaybill = activeWaybill || lastCreatedDomesticWaybill;
    if (!focusedWaybill) return;

    try {
      setIsUpdatingWaybill(true);

      const defaultOrigin = { lat: 4.0511, lng: 9.7679 }; // Douala
      const defaultDest = { lat: 3.848, lng: 11.5021 }; // Yaounde
      const sLoc = getLatLng(liveOriginInput, defaultOrigin);
      const eLoc = getLatLng(liveDestinationInput, defaultDest);
      const totalDist = getGeodesicDistance(sLoc, eLoc);

      let nextStatus = focusedWaybill.status;
      const progressPercent =
        totalDist > 0 ? (liveDistanceCovered / totalDist) * 100 : 0;
      if (progressPercent >= 100) {
        nextStatus = "DELIVERED";
      } else if (progressPercent >= 75) {
        nextStatus = "GATEWAY_CUSTOMS_HOLD";
      } else if (progressPercent >= 50) {
        nextStatus = "IN_OVERLAND_TRANSIT";
      } else if (progressPercent >= 25) {
        nextStatus = "DRY_BULK_SORTED";
      } else {
        nextStatus = "MANIFEST_CREATED";
      }

      const hasStatusChanged = nextStatus !== focusedWaybill.status;
      const historyPoint = {
        status: nextStatus,
        location:
          progressPercent >= 100
            ? liveDestinationInput
            : progressPercent <= 0
            ? liveOriginInput
            : "In Route Overland Hub Segment",
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }),
        activity: `System-dispatched geolocation progress: Advanced driving telemetry to ${Math.round(
          progressPercent
        )}% milestone.`,
      };

      const updatedShipment = {
        ...focusedWaybill,
        origin: liveOriginInput,
        destination: liveDestinationInput,
        transitCheckpoint: liveCheckpointInput,
        destinationAddress: liveDestinationInput,
        hoursDriven: liveHoursDriven,
        distanceCovered: liveDistanceCovered,
        status: nextStatus,
        history: hasStatusChanged
          ? [...(focusedWaybill.history || []), historyPoint]
          : focusedWaybill.history || [],
      };

      const response = await fetch("/api/register-shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: updatedShipment,
          insights: focusedWaybill.insights,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update shipment hubs.");
      }

      const resData = await response.json();
      const finalShipment = resData.shipment;

      setServerShipments((prev) =>
        prev.map((s) =>
          s.orderId === finalShipment.orderId ? finalShipment : s
        )
      );

      if (
        lastCreatedDomesticWaybill &&
        lastCreatedDomesticWaybill.orderId === finalShipment.orderId
      ) {
        setLastCreatedDomesticWaybill(finalShipment);
      }

      if (activeWaybill && activeWaybill.orderId === finalShipment.orderId) {
        setActiveWaybill(finalShipment);
      }

      setDispatchStatusMsg(
        "Route coordinate metrics updated live and synchronized with the public server!"
      );
      setTimeout(() => setDispatchStatusMsg(null), 5000);
    } catch (err) {
      console.error(err);
      setDispatchStatusMsg(
        "Error committing coordinate updates to server database."
      );
    } finally {
      setIsUpdatingWaybill(false);
    }
  };

  const handleSendDynamicNotification = (isLinkOnly: boolean = false) => {
    if (!lastCreatedDomesticWaybill) return;

    setDispatchStatusMsg("Processing alert transmission...");

    setTimeout(() => {
      const modeText =
        dispatchChannel === "whatsapp"
          ? "WhatsApp"
          : dispatchChannel === "email"
          ? "Email"
          : "SMS";

      const finalMessage = isLinkOnly
        ? `[Crest Tracking Link] Tap to view your delivery map: ${window.location.origin}/?track=${lastCreatedDomesticWaybill.orderId}`
        : domesticMessageDraft;

      setSimulatedNotifications((prev) => [
        {
          type: dispatchChannel === "phone" ? "sms" : dispatchChannel,
          title: isLinkOnly
            ? "Direct Shipment Link"
            : "Automated Waybill Dispatch",
          text: finalMessage,
          sender: "Crest Admin Operations",
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);

      setDispatchStatusMsg(
        `Success! Automated message was queued and transmitted via ${modeText} to: ${dispatchContactTarget}`
      );
    }, 900);
  };

  const simulateRecipientDispatch = (type: "whatsapp" | "sms" | "email") => {
    if (!activeWaybill) return;
    setIsAlertSending(true);
    setAlertSuccessMsg(null);

    setTimeout(() => {
      setIsAlertSending(false);
      let text = "";
      let title = "";
      let sender = "";
      const trackingUrl = `http://localhost:3000/?track=${activeWaybill.orderId}`;

      if (type === "whatsapp") {
        sender = "Crest Alerts";
        title = "💬 Crest WhatsApp Node";
        text = `Hello ${activeWaybill.customerName}, Crest Logistics has successfully archived your cargo manifest under Waybill ${activeWaybill.orderId}. Track live terminal check-ins: ${trackingUrl}`;
      } else if (type === "sms") {
        sender = "+1 (844) CREST-GO";
        title = "📲 Outbound SMS Dispatch";
        text = `[Crest Logistics Node] Shipment verified! ID: ${activeWaybill.orderId}. Hand-off schedule assigned. Track container status live here: ${trackingUrl}`;
      } else {
        sender = "operations@crest-logistics.com";
        title = "✉️ Bill of Lading & Waybill Invoice";
        text = `Attention: ${activeWaybill.customerName}\nWe have registered your container payload of ${activeWaybill.items.length} item line list. Gross weight: ${activeWaybill.weight} kg. View original document cargo checklist metrics: ${trackingUrl}`;
      }

      setSimulatedNotifications((prev) => [
        {
          type,
          title,
          text,
          sender,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...prev,
      ]);

      setAlertSuccessMsg(
        `Simulated ${type.toUpperCase()} message dispatch triggered. Recipient mobile node received update!`
      );

      setTimeout(() => setAlertSuccessMsg(null), 5000);
    }, 1000);
  };

  const updateShipmentMilestoneOnServer = async (
    id: string,
    nextStatus: string
  ) => {
    const found = serverShipments.find((s) => s.orderId === id);
    if (!found) return;

    let desc = "Status updated by admin console operator.";
    let loc = "Crest Logistics Transgress Terminal";

    if (nextStatus === "DRY_BULK_SORTED") {
      desc =
        "Consolidation verification completed. Dynamic wrapping secure seals locked.";
      loc = "Crest Packaging Hub";
    } else if (nextStatus === "IN_OVERLAND_TRANSIT") {
      desc =
        "Secure container loaded onto heavy cargo fleet. Highway transit initiated.";
      loc = "Crest Logistics Gate 2";
    } else if (nextStatus === "GATEWAY_CUSTOMS_HOLD") {
      desc =
        "Cross-border verification protocol triggered. Custom clearing cargo holding.";
      loc = "Gateway Border Custody Checkpoint";
    } else if (nextStatus === "DELIVERED") {
      desc =
        "Consignee delivery handshake successfully executed. Waybill status closed.";
      loc = found.destination.split(",")[0] || "Destination Site";
    }

    const nextHistoryPoint = {
      status: nextStatus,
      location: loc,
      description: desc,
      date:
        new Date().toISOString().replace("T", " ").replace(/\..+/, "") + " UTC",
    };

    const updatedShipment = {
      ...found,
      status: nextStatus,
      history: [...found.history, nextHistoryPoint],
    };

    try {
      const response = await fetch("/api/register-shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: updatedShipment,
          insights: updatedShipment.insights,
        }),
      });

      if (response.ok) {
        setServerShipments((prev) =>
          prev.map((s) => (s.orderId === id ? updatedShipment : s))
        );

        if (publicFoundShipment && publicFoundShipment.orderId === id) {
          setPublicFoundShipment(updatedShipment);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteShipmentFromServer = async (id: string) => {
    try {
      const response = await fetch(`/api/shipments/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setServerShipments((prev) => prev.filter((s) => s.orderId !== id));
        if (publicFoundShipment && publicFoundShipment.orderId === id) {
          setPublicFoundShipment(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    const nextHistory = [
      ...chatHistory,
      { sender: "user" as const, text: userText },
    ];
    setChatHistory(nextHistory);
    setChatMessage("");

    setChatHistory((prev) => [...prev, { sender: "bot", text: "..." }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history: chatHistory }),
      });
      const data = await res.json();
      if (data.reply?.includes("[NEEDS_HUMAN]")) {
        setShowHandoff(true);
      }
      const cleanReply = (data.reply || "").replace("[NEEDS_HUMAN]", "").trim();
      setChatHistory((prev) => [
        ...prev.slice(0, -1),
        { sender: "bot", text: cleanReply },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev.slice(0, -1),
        { sender: "bot", text: "Sorry, I'm having trouble connecting. Please try again." },
      ]);
    }
  };
    

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: "", email: "", phone: "", message: "" });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#FAF5E9] dark:bg-[#070c0a] text-[#111E19] dark:text-stone-100 flex flex-col font-sans antialiased selection:bg-[#F7E4A1] selection:text-[#111E19]">
      <header className="w-full bg-white dark:bg-[#0c1411] border-b border-stone-200/60 dark:border-stone-800 shadow-xs sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div
            onClick={() => navigateToSegment("home")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="bg-[#111E19] text-[#F7E4A1] p-2.5 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
              <Ship className="w-6 h-6 text-[#F7E4A1]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-black text-[#111E19] dark:text-stone-100 text-xl tracking-tight uppercase">
                  CREST<span className="text-[#A35638]"> LOGISTICS</span>
                </span>
                <span className="hidden sm:inline bg-[#FAF5E9] dark:bg-[#121f1a] text-[#111E19] dark:text-[#F7E4A1] border border-stone-200/80 dark:border-stone-800 rounded-full px-2.5 py-0.5 text-[9px] font-mono tracking-widest font-bold">
                  GLOBAL
                </span>
              </div>
              <p className="text-[10px] font-sans text-stone-500 dark:text-stone-400 tracking-wide leading-none mt-1">
                Premium Integrated Shipping & Cargo Networks
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => {
                setIsAdminMode(false);
                setActiveTab("home");
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                !isAdminMode && activeTab === "home"
                  ? "bg-[#111E19] text-[#F7E4A1] dark:bg-[#F7E4A1] dark:text-[#111E19] shadow-xs"
                  : "text-stone-600 hover:text-[#111E19] hover:bg-stone-50 dark:text-stone-300 dark:hover:text-white dark:hover:bg-[#121f1a]"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigateToSegment("about")}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                !isAdminMode && activeTab === "about"
                  ? "bg-[#111E19] text-[#F7E4A1] dark:bg-[#F7E4A1] dark:text-[#111E19] shadow-xs"
                  : "text-stone-600 hover:text-[#111E19] hover:bg-stone-50 dark:text-stone-300 dark:hover:text-white dark:hover:bg-[#121f1a]"
              }`}
            >
              About
            </button>
            <button
              onClick={() => navigateToSegment("services")}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                !isAdminMode && activeTab === "services"
                  ? "bg-[#111E19] text-[#F7E4A1] dark:bg-[#F7E4A1] dark:text-[#111E19] shadow-xs"
                  : "text-stone-600 hover:text-[#111E19] hover:bg-stone-50 dark:text-stone-300 dark:hover:text-white dark:hover:bg-[#121f1a]"
              }`}
            >
              Services
            </button>
            <button
              onClick={() => navigateToSegment("contact")}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                !isAdminMode && activeTab === "contact"
                  ? "bg-[#111E19] text-[#F7E4A1] dark:bg-[#F7E4A1] dark:text-[#111E19] shadow-xs"
                  : "text-stone-600 hover:text-[#111E19] hover:bg-stone-50 dark:text-stone-300 dark:hover:text-white dark:hover:bg-[#121f1a]"
              }`}
            >
              Contact
            </button>
            <button
              onClick={() => {
                setIsAdminMode(false);
                setActiveTab("track");
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                !isAdminMode && activeTab === "track"
                  ? "bg-[#111E19] text-[#F7E4A1] dark:bg-[#F7E4A1] dark:text-[#111E19] shadow-xs"
                  : "text-stone-600 hover:text-[#111E19] hover:bg-stone-55 dark:text-stone-300 dark:hover:text-white dark:hover:bg-[#121f1a]"
              }`}
            >
              Track
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-xl border border-stone-200/60 hover:bg-stone-50 text-stone-600 dark:border-stone-800 dark:hover:bg-[#121f1a] dark:text-stone-300 transition-colors shadow-2xs cursor-pointer flex items-center justify-center"
              aria-label="Toggle Theme"
              title={isDark ? "Activate Light Mode" : "Activate Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#F7E4A1]" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600" />
              )}
            </button>

            {!forcePublic && !forceAdminLogin && !forceAdminDashboard && (
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 shadow-2xs ${
                  isAdminMode
                    ? "bg-[#A35638] text-white border-[#A35638] hover:bg-[#8e4529]"
                    : "bg-stone-900 text-[#F7E4A1] hover:bg-stone-850 dark:bg-[#121f1a] dark:text-[#F7E4A1] dark:border-stone-800"
                }`}
              >
                <Lock className="w-3 h-3" />
                <span className="hidden sm:inline">
                  {isAdminMode
                    ? "Exit Admin Control"
                    : "Authorized Admin Login"}
                </span>
                <span className="sm:hidden">
                  {isAdminMode ? "Exit" : "Admin"}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {isAdminMode ? (
        <div className="flex-grow flex flex-col">
          {!isAdminLoggedIn ? (
            <div className="flex-grow flex items-center justify-center p-6 bg-[#FAF5E9]">
              <div className="w-full max-w-md bg-white border border-stone-200/60 rounded-3xl p-8 shadow-lg flex flex-col gap-6">
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-2xl bg-[#111E19] text-[#F7E4A1] mb-4">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-sans font-black text-[#111E19] tracking-tight">
                    Crest Operators Portal
                  </h2>
                  <p className="text-xs text-stone-500 font-sans mt-2">
                    Secured connection portal for terminal admins and dispatch
                    agents.
                  </p>
                </div>

                {authError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-sans font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{authError}</span>
                  </div>
                )}

                <form
                  onSubmit={handleAdminLogin}
                  className="flex flex-col gap-4 font-sans text-xs"
                >
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-extrabold text-stone-600 mb-1">
                      Operator Username
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-stone-200 px-4 py-3 bg-stone-50/50 focus:outline-none focus:border-[#A35638] text-sm text-stone-900"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-extrabold text-stone-600 mb-1">
                      Secure Access PIN CODE
                    </label>
                    <input
                      type="password"
                      placeholder="Enter secure master password"
                      className="w-full rounded-xl border border-stone-200 px-4 py-3 bg-stone-50/50 focus:outline-none focus:border-[#A35638] text-sm text-stone-900"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl flex gap-2 items-start mt-1">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-stone-600 leading-normal">
                      <strong>Demo Access Credentials:</strong> Use username{" "}
                      <span className="font-mono font-bold bg-white px-1 py-0.5 border border-amber-250 rounded">
                        admin
                      </span>{" "}
                      and password{" "}
                      <span className="font-mono font-bold bg-white px-1 py-0.5 border border-amber-250 rounded">
                        admin2026
                      </span>{" "}
                      to bypass.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#111E19] hover:bg-stone-800 text-[#F7E4A1] py-3.5 rounded-xl font-bold uppercase tracking-wider transition-all shadow-md text-xs cursor-pointer"
                  >
                    Authenticate Terminal Connection
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col lg:flex-row bg-[#FAF5E9]">
              <aside className="w-full lg:w-64 bg-white border-b lg:border-r border-stone-200/60 p-5 flex flex-col gap-6 shrink-0">
                <div className="pb-4 border-b border-stone-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF5E9] text-[#A35638] flex items-center justify-center border border-stone-200/50">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm text-[#111E19] tracking-tight">
                      Crest Tower Node
                    </h3>
                    <p className="text-[10px] text-stone-400 font-mono">
                      STATUS: OPERATIONAL
                    </p>
                  </div>
                </div>

                <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible font-sans">
                  <button
                    onClick={() => setAdminSection("register")}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 shrink-0 transition-all ${
                      adminSection === "register"
                        ? "bg-[#111E19] text-[#F7E4A1]"
                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Create & Optimize Waybill</span>
                  </button>
                  <button
                    onClick={() => {
                      setAdminSection("registry");
                      fetchShipmentsDb();
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 shrink-0 transition-all ${
                      adminSection === "registry"
                        ? "bg-[#111E19] text-[#F7E4A1]"
                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>
                      Direct Archive Database ({serverShipments.length})
                    </span>
                  </button>
                  <button
                    onClick={() => setAdminSection("simulator")}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 shrink-0 transition-all ${
                      adminSection === "simulator"
                        ? "bg-[#111E19] text-[#F7E4A1]"
                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>SMS/WhatsApp Simulator</span>
                  </button>
                </nav>

                <div className="hidden lg:flex flex-col gap-3 mt-auto p-4 bg-stone-50 rounded-2xl border border-stone-250">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Secure Operator Session
                  </div>
                  <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                    Connected to regional CRM central database index. Your
                    registered actions log under:{" "}
                    <span className="font-mono text-stone-700 font-bold">
                      Terminal-883A
                    </span>
                    .
                  </p>
                  <button
                    onClick={() => {
                      if (typeof document !== "undefined") {
                        document.cookie = "admin_token=; path=/; max-age=0";
                      }
                      setIsAdminLoggedIn(false);
                      if (onLogout) {
                        onLogout();
                      }
                    }}
                    className="mt-1 w-full text-center text-[10px] font-mono font-bold uppercase text-[#A35638] hover:underline cursor-pointer"
                  >
                    Kill Secure Credentials / Log Out
                  </button>
                </div>
              </aside>

              <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-stone-200/60 p-5 rounded-2xl shadow-2xs">
                  <div>
                    <h2 className="text-xl font-sans font-black text-[#111E19] tracking-tight uppercase">
                      Crest Logistics Operations Core
                    </h2>
                    <p className="text-xs text-stone-500 font-sans mt-0.5">
                      Generate, analyze, and dispatch live cargo containers in
                      Cameroon and international transits.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] bg-stone-50 px-3.5 py-1.5 border border-stone-200 text-stone-600 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-[#A35638]" />
                    <span>UTC Time: {timeStr}</span>
                  </div>
                </div>

                {adminSection === "register" && (
                  <div className="flex flex-col gap-8 w-full">
                    <div className="bg-[#FAF5E9] border border-stone-200/50 rounded-3xl p-4 md:p-8 shadow-xs flex flex-col gap-6">
                      {lastCreatedDomesticWaybill ? (
                        <div className="bg-white border-2 border-[#A35638]/30 rounded-2xl p-6 shadow-md flex flex-col md:flex-row gap-6 animate-fadeIn">
                          <div className="md:w-1/2 flex flex-col gap-4">
                            <div className="flex items-center gap-3 bg-emerald-50 text-emerald-800 border border-emerald-200/50 px-4 py-3 rounded-xl">
                              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                              <div>
                                <h4 className="font-sans font-black text-sm uppercase">
                                  Waybill Issued Successfully!
                                </h4>
                                <p className="text-[11px] opacity-90 mt-0.5">
                                  Domestic ticket has been written to the Crest
                                  Operations Live Registry.
                                </p>
                              </div>
                            </div>

                            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col gap-2">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold">
                                UNIQUE TRACKING ID
                              </span>
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xl font-bold text-[#10241b] tracking-wider">
                                  {lastCreatedDomesticWaybill.orderId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      lastCreatedDomesticWaybill.orderId
                                    );
                                    setDispatchStatusMsg(
                                      "Tracking ID copied to clipboard!"
                                    );
                                  }}
                                  className="p-1.5 border border-stone-200 text-stone-500 hover:text-[#A35638] bg-white rounded-lg transition-all flex items-center gap-1 text-[11px] font-sans font-bold shadow-3xs"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy Code
                                </button>
                              </div>
                            </div>

                            {/* Recipient Overview summary card */}
                            <div className="border border-stone-150 rounded-xl p-4 flex flex-col gap-1.5 bg-white text-xs text-stone-700">
                              <h5 className="font-sans font-black text-[#111E19] uppercase text-[10px] tracking-wider mb-1">
                                RECIPIENT SUMMARY
                              </h5>
                              <p>
                                <strong>To:</strong>{" "}
                                {lastCreatedDomesticWaybill.customerName}
                              </p>
                              <p>
                                <strong>Destination:</strong>{" "}
                                {lastCreatedDomesticWaybill.destination}
                              </p>
                              <p>
                                <strong>Service Type:</strong>{" "}
                                {domesticFormData.fedexServiceTier
                                  ? `FedEx ${domesticFormData.fedexServiceTier}`
                                  : `USPS ${
                                      domesticFormData.uspsPriority
                                        ? "Priority"
                                        : domesticFormData.uspsExpress
                                        ? "Express"
                                        : "Package Services"
                                    }`}
                              </p>
                            </div>

                            {/* Live Route Coordinate Editor Panel */}
                            <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50 flex flex-col gap-3">
                              <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#A35638]" />
                                <h5 className="font-sans font-black text-[#111E19] uppercase text-[10px] tracking-wider">
                                  LIVE ROUTE INTERACTION
                                </h5>
                              </div>

                              <div className="flex flex-col gap-2">
                                <div>
                                  <label className="block text-[8px] font-mono uppercase text-stone-400 font-extrabold mb-1 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-stone-400" />
                                    Sender Location Address (Origin started
                                    address) [Locked]
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full text-xs font-mono rounded-xl border border-stone-200 px-3 py-1.5 text-stone-400 bg-stone-50/50 cursor-not-allowed"
                                    value={liveOriginInput}
                                    readOnly
                                    placeholder="e.g. Toronto, Canada"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[8px] font-mono uppercase text-emerald-600 font-extrabold mb-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                                    Active Transit Checkpoint
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full text-xs font-mono rounded-xl border border-emerald-250 px-3 py-1.5 focus:outline-none focus:border-emerald-500 text-stone-800 bg-emerald-50/20 font-bold"
                                    value={liveCheckpointInput}
                                    onChange={(e) =>
                                      setLiveCheckpointInput(e.target.value)
                                    }
                                    placeholder="e.g. Lagos, Nigeria (bends route live)"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[8px] font-mono uppercase text-stone-400 font-extrabold mb-1 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-stone-400" />
                                    Receiver Location Address (Destination
                                    delivery point) [Locked]
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full text-xs font-mono rounded-xl border border-stone-200 px-3 py-1.5 text-stone-400 bg-stone-50/50 cursor-not-allowed"
                                    value={liveDestinationInput}
                                    readOnly
                                    placeholder="e.g. Douala, Cameroon"
                                  />
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={isUpdatingWaybill}
                                onClick={handleUpdateWaybillHubs}
                                className="w-full bg-[#111E19] hover:bg-[#A35638] text-white py-2 rounded-xl font-bold uppercase tracking-wider text-[9px] flex items-center justify-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                              >
                                {isUpdatingWaybill ? (
                                  <>
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Syncing Live Map...</span>
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Update &amp; Animate Route Live</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setDomesticFormData({
                                  shipDate: new Date()
                                    .toISOString()
                                    .split("T")[0],
                                  sender: "",
                                  senderAddress: "",
                                  senderPhone: "",
                                  cmNumber: "",
                                  fund: "",
                                  org: "",
                                  acct: "",

                                  recipientAddressType: "Business",
                                  recipientTo: "",
                                  recipientCompany: "",
                                  recipientAddress: "",
                                  recipientCityStateZip: "",
                                  recipientPhone: "",

                                  paymentPersonal: false,
                                  packageWeight: "15",
                                  weightUnit: "kg",
                                  paymentMethod: "Credit Card",
                                  paymentBusiness: false,
                                  paymentBillShipper: false,
                                  paymentBill3rdParty: false,
                                  paymentThirdPartyAcct: "",
                                  paymentBillRecipient: false,
                                  paymentRecipientAcct: "",

                                  uspsPriority: false,
                                  uspsExpress: false,
                                  uspsPackageServices: false,

                                  fedexServiceTier: "",
                                  fedexPackaging: "other",

                                  surchargeDirectSignature: false,
                                  surchargeSaturdayDelivery: false,
                                  surchargeHolidayDelivery: false,

                                  insuranceRequired: false,
                                  declaredValue: "",

                                  processedBy: "Agent #2026",
                                  processingDate: new Date()
                                    .toISOString()
                                    .split("T")[0],
                                });
                                setLastCreatedDomesticWaybill(null);
                                setDispatchStatusMsg(null);
                              }}
                              className="w-full mt-2 bg-[#111E19] hover:bg-stone-850 text-white hover:text-amber-100 py-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            >
                              <Plus className="w-4 h-4 text-amber-300" />
                              Start Another Waybill Manifest
                            </button>
                          </div>

                          <div className="md:w-1/2 border-l border-stone-100 md:pl-6 flex flex-col gap-4">
                            <div>
                              <h4 className="font-sans font-black text-[#111E19] text-sm uppercase">
                                AUTOMATED BROADCAST DISPATCH
                              </h4>
                              <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                                Collect recipient details and dispatch custom
                                alerts or direct tracking link instantly.
                              </p>
                            </div>

                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-stone-500">
                                1. Recipient Phone / WhatsApp / Email
                              </label>
                              <input
                                type="text"
                                placeholder="Enter phone, email or WhatsApp number"
                                className="w-full text-xs font-sans rounded-xl border border-stone-300 px-4 py-2.5 bg-white text-stone-900 focus:outline-none focus:border-[#A35638]"
                                value={dispatchContactTarget}
                                onChange={(e) =>
                                  setDispatchContactTarget(e.target.value)
                                }
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-stone-500">
                                2. Dispatch Channel Network
                              </label>
                              <div className="grid grid-cols-3 gap-1.5 bg-stone-100 p-1 rounded-xl">
                                <button
                                  type="button"
                                  onClick={() => setDispatchChannel("whatsapp")}
                                  className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                                    dispatchChannel === "whatsapp"
                                      ? "bg-[#111E19] text-[#F7E4A1]"
                                      : "text-stone-500 hover:text-stone-800"
                                  }`}
                                >
                                  <MessageSquare className="w-3 h-3 text-[#52b788]" />
                                  WhatsApp
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDispatchChannel("sms")}
                                  className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                                    dispatchChannel === "sms"
                                      ? "bg-[#111E19] text-[#F7E4A1]"
                                      : "text-stone-500 hover:text-stone-800"
                                  }`}
                                >
                                  <Smartphone className="w-3 h-3 text-amber-500" />
                                  SMS Text
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDispatchChannel("email")}
                                  className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                                    dispatchChannel === "email"
                                      ? "bg-[#111E19] text-[#F7E4A1]"
                                      : "text-stone-500 hover:text-stone-800"
                                  }`}
                                >
                                  <Mail className="w-3 h-3 text-[#A35638]" />
                                  E-Mail
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-stone-500">
                                3. Review Automated Message Template Draft
                              </label>
                              <textarea
                                className="w-full text-xs font-mono border border-stone-200 px-3 py-2 rounded-xl text-stone-700 min-h-24 leading-normal focus:outline-[#A35638] resize-none"
                                value={domesticMessageDraft}
                                onChange={(e) =>
                                  setDomesticMessageDraft(e.target.value)
                                }
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSendDynamicNotification(false)
                                }
                                className="bg-[#A35638] hover:bg-[#8d4629] text-white py-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1 shadow-md transition-all"
                              >
                                <Send className="w-3.5 h-3.5" />
                                Send Message
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSendDynamicNotification(true)
                                }
                                className="bg-[#FAF5E9] border border-stone-350 text-stone-750 hover:text-stone-900 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1 hover:border-[#A35638] transition-all"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-[#111E19]" />
                                Send Link
                              </button>
                            </div>

                            {dispatchStatusMsg && (
                              <div className="bg-[#F7E4A1]/30 border border-[#F7E4A1] text-stone-850 rounded-xl p-3 text-[11px] font-sans font-semibold leading-relaxed animate-pulse">
                                {dispatchStatusMsg}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <form
                          onSubmit={handleRegisterDomesticWaybill}
                          className="bg-white border border-stone-200/60 rounded-3xl p-5 md:p-8 shadow-xs flex flex-col gap-6 selection:bg-[#F7E4A1]"
                        >
                          <div className="text-center pb-5 border-b-2 border-[#111E19] flex flex-col items-center justify-center">
                            <h3 className="font-sans font-black text-[#111E19] text-xl md:text-2xl tracking-widest uppercase">
                              PACKAGE SHIPPING FORM
                            </h3>
                            <span className="font-sans font-bold text-xs bg-[#F7E4A1] text-[#111E19] px-4 py-0.5 rounded-full mt-2 tracking-widest uppercase">
                              (DOMESTIC ONLY)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="flex flex-col gap-4 border-r-0 md:border-r border-stone-100 md:pr-6">
                              <h4 className="text-[11px] font-sans font-black tracking-widest text-[#A35638] uppercase border-b border-stone-100 pb-1.5 flex items-center gap-1">
                                <span>1. SENDER INFORMATION (ORIGIN)</span>
                              </h4>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                  <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                                    Ship Date
                                  </label>
                                  <input
                                    type="date"
                                    className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3 py-2.5 focus:outline-none focus:border-[#A35638] text-stone-800 bg-white"
                                    value={domesticFormData.shipDate}
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        shipDate: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="col-span-2">
                                  <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                                    Sender Name
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Enter shipper complete name"
                                    className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:border-[#A35638] text-stone-800 bg-white"
                                    value={domesticFormData.sender}
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        sender: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="col-span-2">
                                  <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                                    Sender Location Address
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Vancouver, Canada or Dallas, TX"
                                    className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:border-[#A35638] text-stone-800 bg-white"
                                    value={domesticFormData.senderAddress}
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        senderAddress: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="col-span-1">
                                  <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                                    Your Phone #
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Sender phone #"
                                    className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:border-[#A35638] text-stone-800 bg-white"
                                    value={domesticFormData.senderPhone}
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        senderPhone: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="col-span-1">
                                  <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                                    CM # Code
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Cargo CM code"
                                    className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:border-[#A35638] text-stone-800 bg-white"
                                    value={domesticFormData.cmNumber}
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        cmNumber: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              <div className="bg-stone-50/70 border border-stone-200/50 p-3 rounded-2xl flex flex-col gap-2">
                                <span className="text-[9px] font-mono font-black text-stone-400 tracking-wider">
                                  FINANCIAL LEDGER ACCOUNTS
                                </span>
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="block text-[9px] font-sans uppercase text-stone-500 mb-0.5">
                                      Fund
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Fund"
                                      className="w-full text-xs text-center font-sans rounded-lg border border-stone-300 px-2.5 py-1.5 focus:outline-none bg-white font-mono"
                                      value={domesticFormData.fund}
                                      onChange={(e) =>
                                        setDomesticFormData({
                                          ...domesticFormData,
                                          fund: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-sans uppercase text-stone-500 mb-0.5">
                                      Org
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Org"
                                      className="w-full text-xs text-center font-sans rounded-lg border border-stone-300 px-2.5 py-1.5 focus:outline-none bg-white font-mono"
                                      value={domesticFormData.org}
                                      onChange={(e) =>
                                        setDomesticFormData({
                                          ...domesticFormData,
                                          org: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-sans uppercase text-stone-500 mb-0.5">
                                      Acct
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Acct"
                                      className="w-full text-xs text-center font-sans rounded-lg border border-stone-300 px-2.5 py-1.5 focus:outline-none bg-white font-mono"
                                      value={domesticFormData.acct}
                                      onChange={(e) =>
                                        setDomesticFormData({
                                          ...domesticFormData,
                                          acct: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-4">
                              <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                                <h4 className="text-[11px] font-sans font-black tracking-widest text-[#A35638] uppercase flex items-center gap-1">
                                  <span>
                                    2. RECIPIENT INFORMATION (DESTINATION)
                                  </span>
                                </h4>

                                <div className="flex bg-stone-100 border border-stone-200 p-0.5 rounded-lg text-[9px] font-sans font-bold">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        recipientAddressType: "Business",
                                      })
                                    }
                                    className={`px-2 py-0.5 rounded transition-all ${
                                      domesticFormData.recipientAddressType ===
                                      "Business"
                                        ? "bg-[#111E19] text-[#F7E4A1] shadow-2xs"
                                        : "text-stone-500 hover:text-stone-850"
                                    }`}
                                  >
                                    Business
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        recipientAddressType: "Residential",
                                      })
                                    }
                                    className={`px-2 py-0.5 rounded transition-all ${
                                      domesticFormData.recipientAddressType ===
                                      "Residential"
                                        ? "bg-[#111E19] text-[#F7E4A1] shadow-2xs"
                                        : "text-stone-500 hover:text-stone-850"
                                    }`}
                                  >
                                    Residential
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                  <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                                    To (Consignee Name)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Enter recipient full name"
                                    className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:border-[#A35638] text-stone-800 bg-white"
                                    value={domesticFormData.recipientTo}
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        recipientTo: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="col-span-2">
                                  <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                                    Company
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Company name (optional)"
                                    className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:border-[#A35638] text-stone-800 bg-white"
                                    value={domesticFormData.recipientCompany}
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        recipientCompany: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="col-span-2">
                                  <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                                    Street Address
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Apartment, unit, suite, or block layout"
                                    className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:border-[#A35638] text-stone-800 bg-white"
                                    value={domesticFormData.recipientAddress}
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        recipientAddress: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="col-span-1">
                                  <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                                    City / State / Zip
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. New York, NY 10001"
                                    className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:border-[#A35638] text-stone-800 bg-white"
                                    value={
                                      domesticFormData.recipientCityStateZip
                                    }
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        recipientCityStateZip: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="col-span-1">
                                  <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                                    Recipient Phone #
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Phone number required"
                                    className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:border-[#A35638] text-stone-800 bg-white"
                                    value={domesticFormData.recipientPhone}
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        recipientPhone: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {aiRouteAnalysis && (
                            <div className="bg-[#111E19] border border-stone-800 text-stone-100 rounded-3xl p-5 md:p-6 shadow-md flex flex-col md:flex-row justify-between gap-6 items-stretch animate-fadeIn">
                              <div className="flex-1 flex flex-col justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span className="font-sans font-black text-[10px] tracking-widest text-emerald-400 uppercase">
                                    AI REAL-TIME ROUTE & TRANSIT ANALYZER
                                  </span>
                                </div>
                                <div className="mt-3">
                                  <h4 className="font-sans text-stone-300 font-extrabold text-[11px] uppercase tracking-wider">
                                    Dynamic Routing Route Corridor
                                  </h4>
                                  <p className="font-black text-white text-base md:text-lg mt-0.5 tracking-tight font-sans">
                                    {aiRouteAnalysis.corridorName}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4 text-xs font-mono">
                                  <div>
                                    <span className="text-stone-400 block text-[9px] uppercase font-bold tracking-wider">
                                      Total Geonotation:
                                    </span>
                                    <span className="font-semibold text-emerald-400">
                                      {aiRouteAnalysis.distanceKm} km
                                    </span>{" "}
                                    ({aiRouteAnalysis.distanceMiles} miles)
                                  </div>
                                  <div>
                                    <span className="text-stone-400 block text-[9px] uppercase font-bold tracking-wider">
                                      Est. Traveling Days:
                                    </span>
                                    <span className="font-extrabold text-[#F7E4A1] text-sm leading-none">
                                      {aiRouteAnalysis.travellingDays} Days
                                    </span>
                                  </div>
                                  <div className="col-span-2 lg:col-span-1">
                                    <span className="text-stone-400 block text-[9px] uppercase font-bold tracking-wider">
                                      Continuous Hours:
                                    </span>
                                    <span className="font-bold text-stone-200">
                                      {aiRouteAnalysis.travellingHours} hrs
                                      driving
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-full md:w-[220px] bg-emerald-950/40 border border-emerald-900/30 rounded-2xl p-4 flex flex-col justify-center text-center">
                                <div className="text-[10px] font-sans font-extrabold text-[#F7E4A1] uppercase tracking-wider mb-2">
                                  ⚡ Smart Dispatch Guidance
                                </div>
                                <p className="text-[10px] text-stone-300 font-medium leading-relaxed">
                                  System-assigned overland corridor maps
                                  real-time driving. At standard 80 km/h
                                  logistics speed, route yields transit period
                                  of{" "}
                                  <strong className="text-white">
                                    {aiRouteAnalysis.travellingDays} days
                                  </strong>{" "}
                                  no matter what.
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-stone-100 pt-5">
                            <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-200/50 flex flex-col gap-3">
                              <h4 className="text-[10px] font-sans font-black text-[#111E19] tracking-wider uppercase border-b border-stone-200/30 pb-1">
                                3... CHOOSE PAYMENT METHOD
                              </h4>

                              <div className="flex flex-col gap-2.5 text-xs text-stone-700 font-sans">
                                <label className="flex items-center gap-2 cursor-pointer font-medium selection:bg-none">
                                  <input
                                    type="radio"
                                    name="paymentType"
                                    className="text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                    checked={domesticFormData.paymentPersonal}
                                    onChange={() =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        paymentPersonal: true,
                                        paymentBusiness: false,
                                        paymentBillShipper: false,
                                        paymentBill3rdParty: false,
                                        paymentBillRecipient: false,
                                      })
                                    }
                                  />
                                  <span>Personal Account Billing</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer font-medium selection:bg-none">
                                  <input
                                    type="radio"
                                    name="paymentType"
                                    className="text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                    checked={domesticFormData.paymentBusiness}
                                    onChange={() =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        paymentPersonal: false,
                                        paymentBusiness: true,
                                        paymentBillShipper: false,
                                        paymentBill3rdParty: false,
                                        paymentBillRecipient: false,
                                      })
                                    }
                                  />
                                  <span>Corporate Business Billing</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer font-medium selection:bg-none">
                                  <input
                                    type="radio"
                                    name="paymentType"
                                    className="text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                    checked={
                                      domesticFormData.paymentBillShipper
                                    }
                                    onChange={() =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        paymentPersonal: false,
                                        paymentBusiness: false,
                                        paymentBillShipper: true,
                                        paymentBill3rdParty: false,
                                        paymentBillRecipient: false,
                                      })
                                    }
                                  />
                                  <span>Bill Credit Card (Shipper Vault)</span>
                                </label>

                                <div className="flex flex-col gap-1.5">
                                  <label className="flex items-center gap-2 cursor-pointer font-medium selection:bg-none">
                                    <input
                                      type="radio"
                                      name="paymentType"
                                      className="text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                      checked={
                                        domesticFormData.paymentBill3rdParty
                                      }
                                      onChange={() =>
                                        setDomesticFormData({
                                          ...domesticFormData,
                                          paymentPersonal: false,
                                          paymentBusiness: false,
                                          paymentBillShipper: false,
                                          paymentBill3rdParty: true,
                                          paymentBillRecipient: false,
                                        })
                                      }
                                    />
                                    <span>Bill 3rd Party FedEx Account</span>
                                  </label>
                                  {domesticFormData.paymentBill3rdParty && (
                                    <input
                                      type="text"
                                      placeholder="Enter 9-Digit FedEx Account #"
                                      className="w-full text-[11px] font-mono rounded-lg border border-stone-300 px-2.5 py-1.5 focus:outline-none focus:border-[#A35638] bg-white text-stone-800 ml-5 w-[calc(100%-24px)] animate-fadeIn"
                                      value={
                                        domesticFormData.paymentThirdPartyAcct
                                      }
                                      onChange={(e) =>
                                        setDomesticFormData({
                                          ...domesticFormData,
                                          paymentThirdPartyAcct: e.target.value,
                                        })
                                      }
                                    />
                                  )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <label className="flex items-center gap-2 cursor-pointer font-medium selection:bg-none">
                                    <input
                                      type="radio"
                                      name="paymentType"
                                      className="text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                      checked={
                                        domesticFormData.paymentBillRecipient
                                      }
                                      onChange={() =>
                                        setDomesticFormData({
                                          ...domesticFormData,
                                          paymentPersonal: false,
                                          paymentBusiness: false,
                                          paymentBillShipper: false,
                                          paymentBill3rdParty: false,
                                          paymentBillRecipient: true,
                                        })
                                      }
                                    />
                                    <span>Bill Recipient's FedEx Account</span>
                                  </label>
                                  {domesticFormData.paymentBillRecipient && (
                                    <input
                                      type="text"
                                      placeholder="Enter 9-Digit FedEx Recipient #"
                                      className="w-full text-[11px] font-mono rounded-lg border border-stone-300 px-2.5 py-1.5 focus:outline-none focus:border-[#A35638] bg-white text-stone-800 ml-5 w-[calc(100%-24px)] animate-fadeIn"
                                      value={
                                        domesticFormData.paymentRecipientAcct
                                      }
                                      onChange={(e) =>
                                        setDomesticFormData({
                                          ...domesticFormData,
                                          paymentRecipientAcct: e.target.value,
                                        })
                                      }
                                    />
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-200/50 flex flex-col gap-3">
                              <h4 className="text-[10px] font-sans font-black text-[#111E19] tracking-wider uppercase border-b border-stone-200/30 pb-1">
                                4... U...S. POSTAL PACKAGE SERVICES
                              </h4>

                              <div className="flex flex-col gap-2.5 text-xs text-stone-700 font-sans">
                                <label className="flex items-center gap-2 cursor-pointer font-medium selection:bg-none">
                                  <input
                                    type="checkbox"
                                    className="rounded text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                    checked={domesticFormData.uspsPriority}
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        uspsPriority: e.target.checked,
                                      })
                                    }
                                  />
                                  <div className="flex flex-col">
                                    <span>
                                      Priority Mail (2-3 Days Estimated
                                      Delivery)
                                    </span>
                                    <span className="text-[9px] text-stone-400">
                                      Domestic flat-rate packaging files
                                    </span>
                                  </div>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer font-medium selection:bg-none">
                                  <input
                                    type="checkbox"
                                    className="rounded text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                    checked={domesticFormData.uspsExpress}
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        uspsExpress: e.target.checked,
                                      })
                                    }
                                  />
                                  <div className="flex flex-col">
                                    <span>
                                      Express Mail (1-2 Days Guaranteed
                                      Overnight)
                                    </span>
                                    <span className="text-[9px] text-stone-400">
                                      Signature required flat dispatch option
                                      available
                                    </span>
                                  </div>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer font-medium selection:bg-none">
                                  <input
                                    type="checkbox"
                                    className="rounded text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                    checked={
                                      domesticFormData.uspsPackageServices
                                    }
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        uspsPackageServices: e.target.checked,
                                      })
                                    }
                                  />
                                  <div className="flex flex-col">
                                    <span>
                                      Package Services (All other structural
                                      courier classes)
                                    </span>
                                    <span className="text-[9px] text-stone-400">
                                      Library and Media Cargo classifications
                                      included
                                    </span>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-stone-100 pt-5 flex flex-col gap-3">
                            <div className="flex justify-between items-center bg-stone-100/60 p-2 px-3 rounded-xl">
                              <h4 className="text-[11px] font-sans font-black text-[#111E19] uppercase tracking-wider">
                                5. FEDEX SPECIALIZED PACKAGE SERVICES MATRIX
                              </h4>
                              <span className="text-[9px] bg-[#A35638] text-white px-2 py-0.5 rounded font-mono font-bold">
                                CHOOSE 1 SERVICE ROW
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-1.5 text-xs font-sans text-stone-700">
                              <div
                                className={`border rounded-xl p-3 flex flex-col gap-2.5 transition-all ${
                                  domesticFormData.fedexServiceTier ===
                                  "PriorityOvernight"
                                    ? "bg-[#FAF5E9]/50 border-[#A35638] ring-1 ring-[#A35638]"
                                    : "border-stone-200 bg-white hover:border-stone-350"
                                }`}
                              >
                                <div className="pb-1 border-b border-stone-150">
                                  <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[#111E19]">
                                    <input
                                      type="radio"
                                      name="fedexTier"
                                      className="text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                      checked={
                                        domesticFormData.fedexServiceTier ===
                                        "PriorityOvernight"
                                      }
                                      onChange={() =>
                                        setDomesticFormData({
                                          ...domesticFormData,
                                          fedexServiceTier: "PriorityOvernight",
                                        })
                                      }
                                    />
                                    <span>Priority Overnight</span>
                                  </label>
                                  <span className="text-[9px] block text-stone-400 font-sans mt-0.5 leading-none">
                                    Delivered next business a.m.
                                  </span>
                                </div>

                                {domesticFormData.fedexServiceTier ===
                                  "PriorityOvernight" && (
                                  <div className="flex flex-col gap-1.5 text-[10px] pl-0.5 font-bold animate-fadeIn">
                                    <span className="text-[8px] uppercase tracking-wider text-[#A35638] font-bold">
                                      Packaging type
                                    </span>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_po"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "letter"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "letter",
                                          })
                                        }
                                      />{" "}
                                      Letter
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_po"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "pak"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "pak",
                                          })
                                        }
                                      />{" "}
                                      FedEx Pak
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_po"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "box"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "box",
                                          })
                                        }
                                      />{" "}
                                      FedEx Box
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_po"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "other"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "other",
                                          })
                                        }
                                      />{" "}
                                      Other Packaging
                                    </label>
                                  </div>
                                )}
                              </div>

                              <div
                                className={`border rounded-xl p-3 flex flex-col gap-2.5 transition-all ${
                                  domesticFormData.fedexServiceTier ===
                                  "StandardOvernight"
                                    ? "bg-[#FAF5E9]/50 border-[#A35638] ring-1 ring-[#A35638]"
                                    : "border-stone-200 bg-white hover:border-stone-350"
                                }`}
                              >
                                <div className="pb-1 border-b border-stone-150">
                                  <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[#111E19]">
                                    <input
                                      type="radio"
                                      name="fedexTier"
                                      className="text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                      checked={
                                        domesticFormData.fedexServiceTier ===
                                        "StandardOvernight"
                                      }
                                      onChange={() =>
                                        setDomesticFormData({
                                          ...domesticFormData,
                                          fedexServiceTier: "StandardOvernight",
                                        })
                                      }
                                    />
                                    <span>Standard Overnight</span>
                                  </label>
                                  <span className="text-[9px] block text-stone-400 font-sans mt-0.5 leading-none">
                                    Delivered next business p.m.
                                  </span>
                                </div>

                                {domesticFormData.fedexServiceTier ===
                                  "StandardOvernight" && (
                                  <div className="flex flex-col gap-1.5 text-[10px] pl-0.5 font-bold animate-fadeIn">
                                    <span className="text-[8px] uppercase tracking-wider text-[#A35638] font-bold">
                                      Packaging type
                                    </span>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_so"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "letter"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "letter",
                                          })
                                        }
                                      />{" "}
                                      Letter
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_so"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "pak"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "pak",
                                          })
                                        }
                                      />{" "}
                                      FedEx Pak
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_so"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "box"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "box",
                                          })
                                        }
                                      />{" "}
                                      FedEx Box
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_so"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "other"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "other",
                                          })
                                        }
                                      />{" "}
                                      Other Packaging
                                    </label>
                                  </div>
                                )}
                              </div>

                              <div
                                className={`border rounded-xl p-3 flex flex-col gap-2.5 transition-all ${
                                  domesticFormData.fedexServiceTier ===
                                  "FedEx2Day"
                                    ? "bg-[#FAF5E9]/50 border-[#A35638] ring-1 ring-[#A35638]"
                                    : "border-stone-200 bg-white hover:border-stone-350"
                                }`}
                              >
                                <div className="pb-1 border-b border-stone-150">
                                  <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[#111E19]">
                                    <input
                                      type="radio"
                                      name="fedexTier"
                                      className="text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                      checked={
                                        domesticFormData.fedexServiceTier ===
                                        "FedEx2Day"
                                      }
                                      onChange={() =>
                                        setDomesticFormData({
                                          ...domesticFormData,
                                          fedexServiceTier: "FedEx2Day",
                                        })
                                      }
                                    />
                                    <span>FedEx 2-Day</span>
                                  </label>
                                  <span className="text-[9px] block text-stone-400 font-sans mt-0.5 leading-none">
                                    Delivered inside 2 business days
                                  </span>
                                </div>

                                {domesticFormData.fedexServiceTier ===
                                  "FedEx2Day" && (
                                  <div className="flex flex-col gap-1.5 text-[10px] pl-0.5 font-bold animate-fadeIn">
                                    <span className="text-[8px] uppercase tracking-wider text-[#A35638] font-bold">
                                      Packaging type
                                    </span>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_2d"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "letter"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "letter",
                                          })
                                        }
                                      />{" "}
                                      Letter
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_2d"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "pak"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "pak",
                                          })
                                        }
                                      />{" "}
                                      FedEx Pak
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_2d"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "box"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "box",
                                          })
                                        }
                                      />{" "}
                                      FedEx Box
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_2d"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "other"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "other",
                                          })
                                        }
                                      />{" "}
                                      Other Packaging
                                    </label>
                                  </div>
                                )}
                              </div>

                              <div
                                className={`border rounded-xl p-3 flex flex-col gap-2.5 transition-all ${
                                  domesticFormData.fedexServiceTier ===
                                  "ExpressSaver"
                                    ? "bg-[#FAF5E9]/50 border-[#A35638] ring-1 ring-[#A35638]"
                                    : "border-stone-200 bg-white hover:border-stone-350"
                                }`}
                              >
                                <div className="pb-1 border-b border-stone-150">
                                  <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[#111E19]">
                                    <input
                                      type="radio"
                                      name="fedexTier"
                                      className="text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                      checked={
                                        domesticFormData.fedexServiceTier ===
                                        "ExpressSaver"
                                      }
                                      onChange={() =>
                                        setDomesticFormData({
                                          ...domesticFormData,
                                          fedexServiceTier: "ExpressSaver",
                                        })
                                      }
                                    />
                                    <span>Express Saver</span>
                                  </label>
                                  <span className="text-[9px] block text-stone-400 font-sans mt-0.5 leading-none">
                                    Delivered inside 3 business days
                                  </span>
                                </div>

                                {domesticFormData.fedexServiceTier ===
                                  "ExpressSaver" && (
                                  <div className="flex flex-col gap-1.5 text-[10px] pl-0.5 font-bold animate-fadeIn">
                                    <span className="text-[8px] uppercase tracking-wider text-[#A35638] font-bold">
                                      Packaging type
                                    </span>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_es"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "letter"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "letter",
                                          })
                                        }
                                      />{" "}
                                      Letter
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_es"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "pak"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "pak",
                                          })
                                        }
                                      />{" "}
                                      FedEx Pak
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_es"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "box"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "box",
                                          })
                                        }
                                      />{" "}
                                      FedEx Box
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="pkg_es"
                                        checked={
                                          domesticFormData.fedexPackaging ===
                                          "other"
                                        }
                                        onChange={() =>
                                          setDomesticFormData({
                                            ...domesticFormData,
                                            fedexPackaging: "other",
                                          })
                                        }
                                      />{" "}
                                      Other Packaging
                                    </label>
                                  </div>
                                )}
                              </div>

                              <div
                                className={`border rounded-xl p-3 flex flex-col gap-2.5 transition-all ${
                                  domesticFormData.fedexServiceTier === "Ground"
                                    ? "bg-[#FAF5E9]/50 border-[#A35638] ring-1 ring-[#A35638]"
                                    : "border-stone-200 bg-white hover:border-stone-350"
                                }`}
                              >
                                <div className="pb-1 border-b border-stone-150">
                                  <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[#111E19]">
                                    <input
                                      type="radio"
                                      name="fedexTier"
                                      className="text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                      checked={
                                        domesticFormData.fedexServiceTier ===
                                        "Ground"
                                      }
                                      onChange={() =>
                                        setDomesticFormData({
                                          ...domesticFormData,
                                          fedexServiceTier: "Ground",
                                        })
                                      }
                                    />
                                    <span>FedEx Ground</span>
                                  </label>
                                  <span className="text-[9px] block text-stone-400 font-sans mt-0.5 leading-none">
                                    Delivered within 1 to 6 bus days
                                  </span>
                                </div>

                                {domesticFormData.fedexServiceTier ===
                                  "Ground" && (
                                  <div className="flex flex-col gap-1.5 text-[10px] pl-0.5 font-bold animate-fadeIn">
                                    <span className="text-[8px] uppercase tracking-wider text-[#A35638] font-bold">
                                      Packaging type
                                    </span>
                                    <label className="flex items-center gap-1.5 cursor-none font-medium bg-[#F7E4A1]/30 p-1 rounded border border-[#F7E4A1] text-[9px] text-[#A35638] leading-tight select-none">
                                      Standard Ground Cargo Packaging Box
                                      Assigned
                                    </label>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-stone-100 pt-5">
                            <div className="flex flex-col gap-2">
                              <h4 className="text-[10px] font-sans font-black text-[#111E19] tracking-wider uppercase border-b border-stone-100 pb-1">
                                6... FEDEX DELIVERY SPECIAL SURCHARGES
                              </h4>

                              <div className="flex flex-col gap-3 text-xs text-stone-700 font-sans pt-1">
                                <label className="flex items-center gap-2 cursor-pointer font-medium selection:bg-none">
                                  <input
                                    type="checkbox"
                                    className="rounded text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                    checked={
                                      domesticFormData.surchargeDirectSignature
                                    }
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        surchargeDirectSignature:
                                          e.target.checked,
                                      })
                                    }
                                  />
                                  <span>
                                    Direct Recipient Handoff Signature Required
                                  </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer font-medium selection:bg-none">
                                  <input
                                    type="checkbox"
                                    className="rounded text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                    checked={
                                      domesticFormData.surchargeSaturdayDelivery
                                    }
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        surchargeSaturdayDelivery:
                                          e.target.checked,
                                      })
                                    }
                                  />
                                  <span>
                                    Guaranteed Saturday Weekend Delivery
                                  </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer font-medium selection:bg-none">
                                  <input
                                    type="checkbox"
                                    className="rounded text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                    checked={
                                      domesticFormData.surchargeHolidayDelivery
                                    }
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        surchargeHolidayDelivery:
                                          e.target.checked,
                                      })
                                    }
                                  />
                                  <span>
                                    Priority Holiday Cargo Window Option
                                  </span>
                                </label>
                              </div>
                            </div>

                            <div className="bg-[#FAF5E9]/50 border border-[#FAF5E9] p-4 rounded-2xl flex flex-col gap-3">
                              <h4 className="text-[10px] font-sans font-black text-[#A35638] tracking-wider uppercase border-b border-stone-200/50 pb-1">
                                7... ADDITIONAL INSURANCE COVERAGE
                              </h4>

                              <p className="text-[10px] font-sans text-stone-500 leading-normal">
                                First $100 value of commercial cargo package
                                listed is protected automatically by general
                                courier mandates.
                              </p>

                              <div className="flex flex-col gap-3 font-sans text-xs pt-1">
                                <label className="flex items-center gap-2 cursor-pointer font-bold select-none text-[#111E19]">
                                  <input
                                    type="checkbox"
                                    className="rounded text-[#A35638] focus:ring-[#A35638] border-stone-300"
                                    checked={domesticFormData.insuranceRequired}
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        insuranceRequired: e.target.checked,
                                      })
                                    }
                                  />
                                  <span>
                                    Additional Cargo Insurance Declared
                                  </span>
                                </label>

                                {domesticFormData.insuranceRequired && (
                                  <div className="animate-fadeIn">
                                    <label className="block text-[9px] font-sans font-extrabold uppercase text-stone-500 mb-1">
                                      Declared Cargo Value ($)
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Declare package value in USD (e.g., $1,250.00)"
                                      className="w-full text-xs font-sans rounded-xl border border-[#A35638] px-3.5 py-2 bg-white text-stone-900 focus:outline-[#A35638]"
                                      value={domesticFormData.declaredValue}
                                      onChange={(e) =>
                                        setDomesticFormData({
                                          ...domesticFormData,
                                          declaredValue: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-stone-150 pt-5 flex flex-col gap-3.5">
                            <h4 className="text-[11px] font-sans font-black text-[#111E19] uppercase tracking-wider bg-stone-100/60 p-2 px-3 rounded-xl">
                              5.5 CORE PACKAGE METRICS &amp; BILLING METHOD
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                                  Package Weight
                                </label>
                                <div className="flex rounded-xl overflow-hidden border border-stone-300">
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    placeholder="e.g. 15.4"
                                    className="flex-1 text-xs font-sans px-3.5 py-2.5 bg-white text-stone-900 focus:outline-none"
                                    value={domesticFormData.packageWeight}
                                    onChange={(e) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        packageWeight: e.target.value,
                                      })
                                    }
                                  />
                                  <select
                                    className="bg-stone-50 text-xs font-sans text-stone-700 px-3 border-l border-stone-200 focus:outline-none"
                                    value={domesticFormData.weightUnit}
                                    onChange={(e: any) =>
                                      setDomesticFormData({
                                        ...domesticFormData,
                                        weightUnit: e.target.value,
                                      })
                                    }
                                  >
                                    <option value="kg">kg</option>
                                    <option value="lbs">lbs</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                                  Payment Method
                                </label>
                                <select
                                  className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3.5 py-2.5 bg-white text-stone-900 focus:outline-none focus:border-[#A35638]"
                                  value={domesticFormData.paymentMethod}
                                  onChange={(e) =>
                                    setDomesticFormData({
                                      ...domesticFormData,
                                      paymentMethod: e.target.value,
                                    })
                                  }
                                >
                                  <option value="Apple Pay">Apple Pay</option>
                                  <option value="Credit Card">
                                    Credit Card
                                  </option>
                                  <option value="Cash App">Cash App</option>
                                  <option value="PayPal">PayPal</option>
                                  <option value="Other methods">
                                    Other methods
                                  </option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-stone-150 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-stone-600">
                            <div>
                              <label className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                                PROCESSED BY (OPERATOR PIN/ID)
                              </label>
                              <input
                                type="text"
                                className="w-full rounded-xl border border-stone-200 px-3.5 py-2 bg-stone-50/50 text-[#111E19] text-xs font-serif font-bold italic focus:outline-none"
                                value={domesticFormData.processedBy}
                                onChange={(e) =>
                                  setDomesticFormData({
                                    ...domesticFormData,
                                    processedBy: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                                PROCESSING TIMESTAMP RECORD
                              </label>
                              <input
                                type="text"
                                readOnly
                                className="w-full rounded-xl border border-stone-200 px-3.5 py-2 bg-stone-50/50 text-stone-500 font-mono text-xs focus:outline-none cursor-not-allowed"
                                value={domesticFormData.processingDate}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 pt-3 border-t border-stone-100">
                            <button
                              type="submit"
                              disabled={isAdminAnalyzing}
                              className="w-full bg-[#111E19] text-[#F7E4A1] hover:bg-stone-850 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:shadow-lg [word-spacing:0.15em]"
                            >
                              <CheckCircle2 className="w-4 h-4 text-amber-300" />
                              <span>
                                {isAdminAnalyzing
                                  ? "AI REGISTRY COMMITMENT IN PROGRESS..."
                                  : "Commit Manifest & Register Package"}
                              </span>
                            </button>

                            {adminAnalysisError && (
                              <div className="bg-rose-50 border border-rose-150 text-rose-850 rounded-xl p-3 text-xs font-sans text-center font-semibold">
                                {adminAnalysisError}
                              </div>
                            )}
                          </div>

                          <div className="text-center text-[10px] font-mono text-stone-400 border-t border-stone-100 pt-4 flex items-center justify-between">
                            <span>CREST OPERATIONAL ARCHIVES DEPT</span>
                            <span>Rev 11/1/13</span>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {adminSection === "registry" && (
                  <div className="bg-white border border-stone-200/60 rounded-3xl p-6 shadow-xs flex flex-col gap-5">
                    <div className="flex justify-between items-center pb-3 border-b border-stone-100 flex-col lg:flex-row gap-3">
                      <div>
                        <h3 className="font-sans font-black text-base text-[#111E19] uppercase flex items-center gap-1.5">
                          <Database className="w-5 h-5 text-[#A35638]" />
                          Freight Logs Registry Database
                        </h3>
                        <p className="text-xs text-stone-400 mt-0.5 font-sans">
                          Active container manifests stored on Crest Logistics
                          in-memory servers.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3.5 py-2.5 rounded-xl text-xs w-full sm:w-auto group hover:border-[#A35638] transition-colors">
                          <span className="text-[#A35638] font-black uppercase tracking-wider text-[9px] whitespace-nowrap">
                            Sort By:
                          </span>
                          <select
                            id="registry-sorter"
                            className="bg-transparent border-none text-xs text-[#111E19] font-sans font-black focus:outline-none cursor-pointer pr-1"
                            value={sortField}
                            onChange={(e) =>
                              setSortField(e.target.value as any)
                            }
                          >
                            <option value="date-desc">
                              Date (Newest First)
                            </option>
                            <option value="date-asc">
                              Date (Oldest First)
                            </option>
                            <option value="weight-desc">
                              Weight (Heaviest First)
                            </option>
                            <option value="weight-asc">
                              Weight (Lightest First)
                            </option>
                          </select>
                        </div>

                        <div className="relative w-full sm:w-64">
                          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            placeholder="Search Registry..."
                            className="w-full bg-stone-50 border border-stone-200 text-xs text-stone-900 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-[#A35638]"
                            value={serverSearchQuery}
                            onChange={(e) =>
                              setServerSearchQuery(e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-stone-100 rounded-xl">
                      <table className="w-full text-left font-sans text-xs border-collapse">
                        <thead>
                          <tr className="bg-stone-50 text-stone-500 font-mono text-[10px] uppercase font-bold tracking-wider border-b border-stone-200/80">
                            <th className="py-3 px-4">Waybill ID</th>
                            <th className="py-3 px-4">Consignee Client</th>
                            <th className="py-3 px-4">Terminal Destination</th>
                            <th className="py-3 px-4">Crate weight</th>
                            <th className="py-3 px-4">
                              Operational Status Milestone
                            </th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {serverShipments
                            .filter((s) => {
                              const q = serverSearchQuery.toLowerCase();
                              return (
                                (s.orderId || "").toLowerCase().includes(q) ||
                                (s.customerName || "")
                                  .toLowerCase()
                                  .includes(q) ||
                                (s.destination || "").toLowerCase().includes(q)
                              );
                            })
                            .sort((a, b) => {
                              if (sortField.startsWith("date")) {
                                const dateA =
                                  a.shipDate ||
                                  (a.history && a.history[0]?.date) ||
                                  "";
                                const dateB =
                                  b.shipDate ||
                                  (b.history && b.history[0]?.date) ||
                                  "";
                                return sortField === "date-desc"
                                  ? dateB.localeCompare(dateA)
                                  : dateA.localeCompare(dateB);
                              } else {
                                const wtA = parseFloat(a.weight) || 0;
                                const wtB = parseFloat(b.weight) || 0;
                                return sortField === "weight-desc"
                                  ? wtB - wtA
                                  : wtA - wtB;
                              }
                            })
                            .map((shipment) => (
                              <tr
                                key={shipment.orderId}
                                className="hover:bg-stone-50/50 text-stone-700 transition-colors"
                              >
                                <td className="py-3 px-4 font-mono font-black text-[#A35638] text-xs">
                                  {shipment.orderId}
                                </td>
                                <td className="py-3 px-4 font-extrabold text-[#111E19]">
                                  {shipment.customerName}
                                </td>
                                <td className="py-3 px-4 max-w-[200px] truncate text-stone-500">
                                  {shipment.destination}
                                </td>
                                <td className="py-3 px-4 font-mono text-xs">
                                  {shipment.weight} kg
                                </td>
                                <td className="py-3 px-4">
                                  <select
                                    className={`text-[11px] font-sans font-extrabold uppercase rounded-lg border border-stone-200 px-2 py-1 focus:outline-none focus:border-[#A35638] ${
                                      shipment.status === "MANIFEST_CREATED"
                                        ? "bg-stone-100 text-stone-600"
                                        : shipment.status === "DRY_BULK_SORTED"
                                        ? "bg-amber-50 text-amber-700"
                                        : shipment.status === "IN_TRANSIT" ||
                                          shipment.status ===
                                            "IN_OVERLAND_TRANSIT"
                                        ? "bg-sky-50 text-sky-800"
                                        : shipment.status ===
                                          "GATEWAY_CUSTOMS_HOLD"
                                        ? "bg-rose-50 text-rose-800"
                                        : "bg-emerald-50 text-emerald-800"
                                    }`}
                                    value={shipment.status}
                                    onChange={(e) =>
                                      updateShipmentMilestoneOnServer(
                                        shipment.orderId,
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="MANIFEST_CREATED">
                                      Manifest Created
                                    </option>
                                    <option value="DRY_BULK_SORTED">
                                      Consolidated & Sorted
                                    </option>
                                    <option value="IN_OVERLAND_TRANSIT">
                                      In Overland Transit
                                    </option>
                                    <option value="GATEWAY_CUSTOMS_HOLD">
                                      Customs Border Hold
                                    </option>
                                    <option value="DELIVERED">
                                      Delivered to Recipient
                                    </option>
                                  </select>
                                </td>
                                <td className="py-3 px-4 text-right flex items-center justify-end gap-2.5">
                                  <button
                                    onClick={() => {
                                      setActiveWaybill(shipment);
                                      setAdminSection("simulator");
                                    }}
                                    className="text-[10px] font-sans font-bold text-[#A35638] hover:underline"
                                  >
                                    Configure
                                  </button>
                                  <span className="text-stone-300">|</span>
                                  <button
                                    onClick={() => setEditingShipment(shipment)}
                                    className="text-[10px] font-sans font-bold text-sky-600 hover:text-sky-850 hover:underline"
                                  >
                                    Edit Form
                                  </button>
                                  <span className="text-stone-300">|</span>
                                  <button
                                    onClick={() =>
                                      setShipmentToDelete(shipment)
                                    }
                                    className="text-[10px] font-sans font-bold text-rose-600 hover:text-rose-800 hover:underline"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminSection === "simulator" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-6 bg-white border border-stone-200/60 rounded-3xl p-5 md:p-7 shadow-xs flex flex-col gap-6">
                      <div>
                        <h3 className="font-sans font-black text-lg text-[#111E19] uppercase flex items-center gap-2">
                          <Smartphone className="w-5.5 h-5.5 text-emerald-600" />
                          Dispatch Communication Center
                        </h3>
                        <p className="text-xs text-stone-500 font-sans mt-0.5">
                          Simulate pushing instant text notifications, bills of
                          lading, and tracking codes directly to the consignee's
                          phone via terminal websockets.
                        </p>
                      </div>

                      {activeWaybill ? (
                        <div className="bg-[#FAF5E9] border border-stone-250 p-4 rounded-2xl flex flex-col gap-3 font-sans text-xs">
                          <div className="flex justify-between items-center pb-2 border-b border-stone-250/50">
                            <span className="font-mono text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                              Active Waybill focus
                            </span>
                            <span className="font-mono text-xs font-black text-[#A35638]">
                              {activeWaybill.orderId}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[10px] text-stone-400 font-bold leading-tight uppercase">
                                Recipient
                              </p>
                              <p className="font-extrabold text-[#111E19] mt-0.5">
                                {activeWaybill.customerName}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-stone-400 font-bold leading-tight uppercase">
                                Cargo Weight
                              </p>
                              <p className="font-extrabold text-[#111E19] mt-0.5 font-mono">
                                {activeWaybill.weight} kg
                              </p>
                            </div>
                          </div>

                          <div className="border border-stone-250/70 bg-white rounded-xl p-3 flex flex-col gap-2.5 shadow-3xs">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A35638]" />
                              <span className="text-[9px] font-sans font-extrabold text-[#111E19] uppercase tracking-wider">
                                Live Route Alteration
                              </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <div>
                                <label className="block text-[7px] font-mono uppercase text-stone-400 font-extrabold mb-0.5 flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-stone-300" />
                                  Origin Started Address [Locked]
                                </label>
                                <input
                                  type="text"
                                  className="w-full text-[11px] font-mono rounded-lg border border-stone-200 px-2.5 py-1 text-stone-400 bg-stone-50 cursor-not-allowed"
                                  value={liveOriginInput}
                                  readOnly
                                  placeholder="e.g. Toronto, Canada"
                                />
                              </div>

                              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-col gap-3">
                                <div className="flex justify-between items-center text-[10px] font-sans font-black uppercase text-[#111E19]">
                                  <span>🚗 Driving Telemetry Control</span>
                                  <span className="font-mono text-emerald-600">
                                    {Math.round(
                                      adminTravelDistance > 0
                                        ? (liveDistanceCovered /
                                            adminTravelDistance) *
                                            100
                                        : 0
                                    )}
                                    % Covered
                                  </span>
                                </div>

                                {/* Custom progress bar */}
                                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-full transition-all duration-500"
                                    style={{
                                      width: `${
                                        adminTravelDistance > 0
                                          ? Math.min(
                                              100,
                                              (liveDistanceCovered /
                                                adminTravelDistance) *
                                                100
                                            )
                                          : 0
                                      }%`,
                                    }}
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-stone-600">
                                  <div>
                                    <span className="text-stone-400">
                                      Hours Driven:
                                    </span>
                                    <span className="block text-xs font-black text-[#111E19]">
                                      {liveHoursDriven} hrs
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400">
                                      Distance Covered:
                                    </span>
                                    <span className="block text-xs font-black text-[#111E19]">
                                      {Math.round(liveDistanceCovered)} /{" "}
                                      {adminTravelDistance} km
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1.5 mt-1">
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextHrs = liveHoursDriven + 5;
                                        const nextDst = Math.min(
                                          adminTravelDistance,
                                          nextHrs * 80
                                        );
                                        setLiveHoursDriven(nextHrs);
                                        setLiveDistanceCovered(nextDst);
                                      }}
                                      className="flex-1 bg-white hover:bg-stone-100 border border-stone-300 text-[#111E19] py-2.5 rounded-lg font-bold text-[9px] uppercase tracking-wider text-center transition-all select-none"
                                    >
                                      +5 Hrs Driving
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextHrs = liveHoursDriven + 24;
                                        const nextDst = Math.min(
                                          adminTravelDistance,
                                          nextHrs * 80
                                        );
                                        setLiveHoursDriven(nextHrs);
                                        setLiveDistanceCovered(nextDst);
                                      }}
                                      className="flex-1 bg-white hover:bg-stone-100 border border-stone-300 text-[#111E19] py-2.5 rounded-lg font-bold text-[9px] uppercase tracking-wider text-center transition-all select-none"
                                    >
                                      +24 Hrs (1 Day)
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLiveHoursDriven(0);
                                      setLiveDistanceCovered(0);
                                    }}
                                    className="w-full bg-stone-100 hover:bg-rose-50 text-stone-500 hover:text-rose-600 border border-stone-200 hover:border-rose-200 py-1.5 rounded-lg font-bold text-[8px] uppercase tracking-wider text-center transition-all select-none"
                                  >
                                    Reset Geodesic Progress (0 km)
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[7px] font-mono uppercase text-stone-400 font-extrabold mb-0.5 flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-stone-300" />
                                  Destination Delivery Point [Locked]
                                </label>
                                <input
                                  type="text"
                                  className="w-full text-[11px] font-mono rounded-lg border border-stone-200 px-2.5 py-1 text-stone-400 bg-stone-50 cursor-not-allowed"
                                  value={liveDestinationInput}
                                  readOnly
                                  placeholder="e.g. Yaounde, Cameroon"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isUpdatingWaybill}
                              onClick={handleUpdateWaybillHubs}
                              className="w-full bg-[#111E19] hover:bg-[#A35638] text-white py-1.5 rounded-lg font-bold uppercase tracking-wider text-[8px] flex items-center justify-center gap-1 transition-all disabled:opacity-55 cursor-pointer"
                            >
                              {isUpdatingWaybill ? (
                                <span className="w-2.5 h-2.5 border-1.5 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <RefreshCw className="w-2.5 h-[10px]" />
                              )}
                              <span>Apply Real-Time Animation</span>
                            </button>
                          </div>

                          <div className="border-t border-stone-250/50 pt-3 flex flex-col gap-2.5">
                            <p className="text-[10px] font-mono uppercase tracking-wider text-[#A35638] font-bold">
                              Trigger Recipient Alerts:
                            </p>

                            <button
                              disabled={isAlertSending}
                              onClick={() =>
                                simulateRecipientDispatch("whatsapp")
                              }
                              className="w-full bg-[#25D366]/10 text-[#075E54] hover:bg-[#25D366]/20 border border-[#25d366]/30 py-3 rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 transition-all"
                            >
                              <span>💬 Simulate WhatsApp Broadcast</span>
                            </button>

                            <button
                              disabled={isAlertSending}
                              onClick={() => simulateRecipientDispatch("sms")}
                              className="w-full bg-[#111E19] text-[#F7E4A1] hover:bg-stone-850 py-3 rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 transition-all"
                            >
                              <span>📲 Simulate SMS Outbound Alert</span>
                            </button>

                            <button
                              disabled={isAlertSending}
                              onClick={() => simulateRecipientDispatch("email")}
                              className="w-full bg-[#FAF5E9] border text-stone-700 hover:bg-stone-100 py-3 rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 transition-all"
                            >
                              <span>✉️ Send Bill of Lading Email</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center text-xs text-stone-400">
                          <Package className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                          <p className="font-medium">
                            No waybill is currently focused for dispatch
                            simulators.
                          </p>
                          <p className="text-[10px] text-stone-400 mt-1 max-w-sm mx-auto">
                            Go back to the{" "}
                            <strong
                              className="cursor-pointer text-[#A35638]"
                              onClick={() => setAdminSection("register")}
                            >
                              &ldquo;Create & Optimize Waybill&rdquo;
                            </strong>{" "}
                            tab, fill out details, and issue a package ticket to
                            trigger.
                          </p>
                        </div>
                      )}

                      {isAlertSending && (
                        <div className="flex justify-center items-center gap-2 py-4">
                          <RotateCw className="w-4 h-4 text-[#A35638] animate-spin" />
                          <span className="text-xs font-mono text-stone-500">
                            Broadcasting notification wave...
                          </span>
                        </div>
                      )}

                      {alertSuccessMsg && (
                        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs rounded-xl p-3 flex gap-2 items-center font-sans font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{alertSuccessMsg}</span>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-6 flex justify-center py-4 shrink-0">
                      <div className="w-80 h-[480px] bg-stone-900 rounded-[3rem] border-4 border-stone-800 p-3 shadow-2xl relative flex flex-col overflow-hidden">
                        <div className="w-24 h-4 bg-stone-800 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-1.5">
                          <div className="w-8 h-1 bg-stone-700 rounded-full" />
                          <div className="w-1.5 h-1.5 bg-stone-600 rounded-full" />
                        </div>

                        <div className="flex-grow bg-slate-950 rounded-[2.5rem] relative p-4 pt-6 flex flex-col gap-3 font-sans overflow-y-auto overflow-x-hidden text-white sm-screen">
                          <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 border-b border-white/5 pb-1">
                            <span>CR-MOBILE</span>
                            <div className="flex gap-1 items-center">
                              <span>LTE</span>
                              <span className="text-emerald-500">●</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3">
                            <AnimatePresence>
                              {simulatedNotifications.length > 0 ? (
                                simulatedNotifications.map((notif, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{
                                      opacity: 0,
                                      x: -50,
                                      scale: 0.95,
                                    }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 50 }}
                                    className="bg-slate-900 border border-white/10 p-3 rounded-2xl flex flex-col gap-1.5 shadow-md shrink-0 text-left"
                                  >
                                    <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded-md text-[9px] font-mono tracking-wider">
                                      <span className="text-[#F7E4A1] font-bold">
                                        {notif.title}
                                      </span>
                                      <span className="text-stone-400">
                                        {notif.time}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold text-stone-300">
                                        From: {notif.sender}
                                      </p>
                                      <p className="text-[10px] text-stone-400 leading-normal mt-1 whitespace-pre-wrap">
                                        {notif.text}
                                      </p>
                                    </div>

                                    <div className="border-t border-white/5 pt-1.5 mt-1 flex justify-between items-center text-[9px] text-[#F7E4A1] font-bold uppercase tracking-wider">
                                      <span>Click to Track live</span>
                                      <ChevronRight className="w-3 h-3 text-[#A35638]" />
                                    </div>
                                  </motion.div>
                                ))
                              ) : (
                                <div className="text-center py-20 text-stone-500 text-xs flex flex-col items-center justify-center gap-3">
                                  <BellRing className="w-8 h-8 text-stone-600 animate-bounce" />
                                  <p className="max-w-xs leading-relaxed">
                                    No wireless signals received.
                                  </p>
                                  <p className="text-[9px] leading-normal opacity-70">
                                    Trigger WhatsApp, SMS, or Bill of Lading
                                    alerts in the dispatch panel to simulate
                                    push notification arrivals.
                                  </p>
                                </div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-grow">
          {activeTab === "home" && (
            <div className="flex flex-col">
              <section
                id="home"
                className="relative min-h-[82vh] flex items-center justify-center py-20 px-6 overflow-hidden bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(17, 30, 25, 0.93), rgba(17, 30, 25, 0.78)), url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1600')`,
                }}
              >
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F7E4A1]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-5xl mx-auto w-full text-center flex flex-col items-center z-10 text-white px-2">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-[#FAF5E9]/15 backdrop-blur-md text-[#F7E4A1] border border-white/10 px-4 py-2 rounded-full text-xs font-mono tracking-widest uppercase font-bold mb-6 shadow-sm"
                  >
                    <Ship className="w-3.5 h-3.5 text-amber-400" />
                    <span>Crest Logistics & Supply Chain Nodes</span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] max-w-4xl"
                  >
                    Committed to providing <br />
                    <span className="text-[#F7E4A1]">
                      Solutions in Logistics
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-stone-300 text-sm sm:text-base max-w-2xl mt-6 font-sans leading-relaxed"
                  >
                    Delivering secure overland freight, multimodal bulk, and
                    priority sea containers with automated machine tracking.
                    Enter your waybill below for instant visual tracking maps of
                    your consignment.
                  </motion.p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setActiveTab("track");
                      handlePublicTrackSearch(e);
                    }}
                    className="w-full max-w-xl mt-10 bg-white p-2 rounded-2xl md:rounded-full shadow-lg flex flex-col md:flex-row items-center gap-2 border border-stone-200"
                  >
                    <div className="flex items-center gap-2 px-3 flex-1 w-full">
                      <Search className="w-5 h-5 text-stone-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Enter Crest Tracking ID Code e.g. CR-385901-LT"
                        className="bg-transparent text-stone-900 placeholder-stone-400 border-0 h-10 w-full focus:outline-none text-sm font-sans"
                        value={publicSearchQuery}
                        onChange={(e) => setPublicSearchQuery(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full md:w-auto bg-[#111E19] hover:bg-stone-850 text-[#F7E4A1] font-bold text-xs uppercase tracking-widest px-7 py-3 rounded-xl md:rounded-full shrink-0 flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      <span>Track Consignment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-14 pt-8 border-t border-white/15 text-center">
                    <div>
                      <p className="text-[#F7E4A1] text-xl sm:text-2xl font-mono font-black">
                        99.8%
                      </p>
                      <p className="text-stone-400 text-[10px] sm:text-xs font-sans uppercase tracking-wider mt-1">
                        On-Time Port Release
                      </p>
                    </div>
                    <div>
                      <p className="text-[#F7E4A1] text-xl sm:text-2xl font-mono font-black">
                        250k+
                      </p>
                      <p className="text-stone-400 text-[10px] sm:text-xs font-sans uppercase tracking-wider mt-1">
                        Containers Dispatched
                      </p>
                    </div>
                    <div>
                      <p className="text-[#F7E4A1] text-xl sm:text-2xl font-mono font-black">
                        &lt; 700ms
                      </p>
                      <p className="text-stone-400 text-[10px] sm:text-xs font-sans uppercase tracking-wider mt-1">
                        Tracking Sync Speed
                      </p>
                    </div>
                    <div>
                      <p className="text-[#F7E4A1] text-xl sm:text-2xl font-mono font-black">
                        WORLDWIDE
                      </p>
                      <p className="text-stone-400 text-[10px] sm:text-xs font-sans uppercase tracking-wider mt-1">
                        Global Gateway Network
                      </p>
                    </div>
                  </div>

                  <div className="mt-10 flex flex-col sm:flex-row gap-4 mb-4">
                    <button
                      onClick={() => {
                        setActiveTab("track");
                      }}
                      className="bg-[#F7E4A1] hover:bg-[#ebd68f] text-[#111E19] font-sans font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Track & Trace Terminal</span>
                      <ChevronRight className="w-4 h-4 text-[#A35638]" />
                    </button>
                    <button
                      onClick={() => navigateToSegment("about")}
                      className="border-2 border-white text-white hover:bg-white/10 font-sans font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-all flex items-center justify-center gap-1.5"
                    >
                      Learn About Networks
                    </button>
                  </div>
                </div>
              </section>

              <div className="bg-[#FAF5E9]/50 py-20 px-6 border-t border-stone-200/50">
                <div className="max-w-6xl mx-auto flex flex-col gap-10">
                  <div className="text-center">
                    <span className="text-[10px] font-mono tracking-widest text-[#A35638] font-black uppercase">
                      Fleet Operations Showcase
                    </span>
                    <h3 className="font-sans font-black text-[#111E19] text-2xl md:text-3xl mt-1 leading-tight uppercase">
                      High-Fidelity Shipment Workflows
                    </h3>
                    <p className="text-xs text-stone-500 mt-2 max-w-xl mx-auto leading-normal">
                      Explore actual operational environments representing
                      real-time dry-bulk cargo consignments and carrier transit
                      grids.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white border border-stone-200/60 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group">
                      <div className="h-56 overflow-hidden relative">
                        <img
                          src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800"
                          alt="Deep Port Cargo Container Hand-off"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute bottom-3 left-3 bg-[#111E19]/85 text-[#F7E4A1] text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          PORT INGRESS B53
                        </span>
                      </div>
                      <div className="p-5 flex flex-col gap-1.5">
                        <h4 className="font-sans font-black text-sm text-[#111E19] uppercase">
                          Deepsea Container Terminal
                        </h4>
                        <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                          Precision logistics crane systems coordinates heavy
                          bulk shipments onto trans-ocean liner corridors
                          safely.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-stone-200/60 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group">
                      <div className="h-56 overflow-hidden relative">
                        <img
                          src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800"
                          alt="Heavy Overland Delivery Route Trucks"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute bottom-3 left-3 bg-[#111E19]/85 text-[#F7E4A1] text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          TRANSIT CORRIDOR
                        </span>
                      </div>
                      <div className="p-5 flex flex-col gap-1.5">
                        <h4 className="font-sans font-black text-sm text-[#111E19] uppercase">
                          Express Trucking Fleet
                        </h4>
                        <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                          Multi-axle dry cargo trucks crossing bilateral border
                          ingress grids to ensure swift, weather-independent
                          transit.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-stone-200/60 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group">
                      <div className="h-56 overflow-hidden relative">
                        <img
                          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"
                          alt="Smart Cargo Sorting Depot"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute bottom-3 left-3 bg-[#111E19]/85 text-[#F7E4A1] text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          YDE LOGISTICS HUB
                        </span>
                      </div>
                      <div className="p-5 flex flex-col gap-1.5">
                        <h4 className="font-sans font-black text-sm text-[#111E19] uppercase">
                          Smart Logistics Center
                        </h4>
                        <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                          Thermal monitored warehouse racks containing fragile
                          and automated packing crates under strict security
                          clearance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Reviews Section */}
              <div className="py-16 md:py-20 px-6 border-t border-stone-200/50 dark:border-stone-850/80 bg-stone-50/40 dark:bg-stone-900/10">
                <div className="max-w-6xl mx-auto flex flex-col gap-10">
                  <div className="text-center">
                    <span className="text-[10px] font-mono tracking-widest text-[#A35638] font-black uppercase">
                      Consignee Feedback
                    </span>
                    <h3 className="font-sans font-black text-[#111E19] dark:text-stone-100 text-2xl md:text-3xl mt-1 leading-tight uppercase">
                      Trusted By Regional Enterprises
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 max-w-xl mx-auto leading-normal">
                      Read transparent testimonials from logistics directors and
                      procurement leads managing bilateral cargo streams.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#0c1411] border border-stone-200/60 dark:border-stone-800 rounded-3xl p-6 shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <Star className="w-4 h-4 text-stone-300 dark:text-stone-700" />
                          <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 ml-1.5">
                            (4.0)
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-300 italic leading-relaxed">
                          "Excellent parcel delivery and freight handoff
                          services. The consignments are checked with supreme
                          security at each major hub. High sorting efficiency
                          and very prompt service when tracking with their
                          client dashboard!"
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80"
                          alt="Jaime Guaman"
                          className="w-10 h-10 rounded-full object-cover border border-stone-205 dark:border-stone-800"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-sans font-black text-xs text-[#111E19] dark:text-stone-100 uppercase truncate">
                            Jaime Guaman
                          </span>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono mt-0.5 truncate">
                            Andes Import logistics &bull; Operations
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#0c1411] border border-stone-200/60 dark:border-stone-800 rounded-3xl p-6 shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <Star className="w-4 h-4 text-stone-300 dark:text-stone-700" />
                          <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 ml-1.5">
                            (4.0)
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-300 italic leading-relaxed">
                          "Crest's overland raw materials route from the
                          Montreal ports is highly secure. Our sorting
                          compliance checks saw a 20% efficiency surge. Highly
                          prompt, though trans-Canada rail crossings take their
                          usual logistics window."
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center gap-3">
                        <img
                          src="/images/warehouse.jpg"
                          alt="John Wilson"
                          className="w-10 h-10 rounded-full object-cover border border-stone-205 dark:border-stone-800"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-sans font-black text-xs text-[#111E19] dark:text-stone-100 uppercase truncate">
                            John Wilson
                          </span>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono mt-0.5 truncate">
                            Great Lakes Freight &bull; Supply Chain
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#0c1411] border border-stone-200/60 dark:border-stone-800 rounded-3xl p-6 shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <Star className="w-4 h-4 text-stone-300 dark:text-stone-700" />
                          <Star className="w-4 h-4 text-stone-300 dark:text-stone-700" />
                          <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 ml-1.5">
                            (3.0)
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-300 italic leading-relaxed">
                          "Consistent overland distribution and smart
                          warehousing. The physical handoffs at Saint John Port
                          are extremely professional. I'd love more direct API
                          integration routes for enterprise inventory syncing."
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80"
                          alt="Carlos Jackson Hewitt"
                          className="w-10 h-10 rounded-full object-cover border border-stone-205 dark:border-stone-800"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-sans font-black text-xs text-[#111E19] dark:text-stone-100 uppercase truncate">
                            Carlos Jackson Hewitt
                          </span>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono mt-0.5 truncate">
                            Atlantic Maritime &bull; Procurement Dir
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full bg-stone-50/70 dark:bg-[#0c1411]/50 border-t border-stone-200/50 dark:border-stone-850/80 py-16 md:py-24 px-6 md:px-12 transition-colors">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                  <div className="flex-1 flex flex-col gap-8 lg:max-w-[55%]">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#A35638] dark:text-[#FAF5E9]/80 font-black uppercase">
                        Core Foundation
                      </span>
                      <h3 className="font-sans font-black text-[#111E19] dark:text-stone-100 text-2xl md:text-3xl lg:text-4xl mt-1.5 leading-tight uppercase tracking-tight">
                        Our Commitment <br className="hidden lg:block" />
                        to Excellence
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 leading-relaxed max-w-xl font-sans font-medium">
                        Crest operates under a rigorous corporate framework
                        aimed at delivering high-capacity logistics solutions
                        across Canada and worldwide. We continuous-audit each
                        transit node to keep operations pristine and completely
                        flawless.
                      </p>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div className="flex gap-4 items-start">
                        <div className="p-3 bg-[#FAF5E9] dark:bg-[#182a20] rounded-2xl border border-stone-200/50 dark:border-stone-800 text-[#A35638] dark:text-[#F7E4A1] shrink-0">
                          <Target className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="font-sans font-extrabold text-sm text-[#111E19] dark:text-stone-100 uppercase tracking-wider">
                            Expertise & Experience
                          </h4>
                          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
                            Striving for perfection in every aspect of our
                            business. With decades of multi-modal corridor
                            coordination and robust freight handlers, our
                            specialists maintain continuous oversight to guide
                            your cargo safely past inland crossings and sea
                            harbors.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="p-3 bg-[#FAF5E9] dark:bg-[#182a20] rounded-2xl border border-stone-200/50 dark:border-stone-800 text-[#A35638] dark:text-[#F7E4A1] shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="font-sans font-extrabold text-sm text-[#111E19] dark:text-stone-100 uppercase tracking-wider">
                            Customer Centricity
                          </h4>
                          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
                            Always putting our clients' needs first. Working
                            together collaboratively to achieve shared business
                            outcomes, backed by predictive waybill calculators,
                            visual cargo route grids, and proactive custom
                            dispatch scripts.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="p-3 bg-[#FAF5E9] dark:bg-[#182a20] rounded-2xl border border-stone-200/50 dark:border-stone-800 text-[#A35638] dark:text-[#F7E4A1] shrink-0">
                          <Leaf className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="font-sans font-extrabold text-sm text-[#111E19] dark:text-stone-100 uppercase tracking-wider">
                            Sustainable Practices
                          </h4>
                          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
                            Minimising environmental impact with green
                            initiatives. We employ intelligent consolidation
                            algorithms to optimize payload metrics on heavy
                            transits, preventing unnecessary emissions while
                            keeping distribution at state-of-the-art heights.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full lg:max-w-[45%] rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-md flex bg-stone-100 dark:bg-[#070c0a]">
                    <img
                      src="/images/commitment.jpg"
                      alt="Crest Logistics Commitment"
                      className="w-full h-auto object-cover aspect-4/3 md:aspect-video lg:aspect-square"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full bg-[#111E19] text-[#F7E4A1] border-t border-b border-[#182a20] py-16 md:py-24 px-6 md:px-12 transition-colors">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                  <div className="flex-1 flex flex-col gap-6 lg:max-w-[55%]">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        <span className="text-[10px] font-mono tracking-widest text-[#F7E4A1] uppercase font-black">
                          Terminal Field Operations
                        </span>
                      </div>
                      <h3 className="font-sans font-black text-yellow-300 dark:text-yellow-400 text-3xl md:text-3xl lg:text-4xl uppercase tracking-tight leading-tight">
                        Crest Container Operations & Seal Integrity Check
                      </h3>
                      <p className="text-sm text-yellow-100/90 leading-relaxed font-sans mt-2">
                        We deploy certified logistical personnel at the primary
                        ocean container stacks to perform physical check-ins.
                        Working hand-in-hand with regional port administrations,
                        Crest verifies mechanical security locks, handles
                        customs clearances, and synchronizes manifest weights
                        prior to heavy overland transit.
                      </p>
                    </div>

                    <div className="flex flex-col gap-5 mt-2">
                      <div className="flex gap-4 items-start bg-[#182a20]/45 p-4 rounded-2xl border border-yellow-500/25">
                        <div className="p-2.5 bg-yellow-450/15 rounded-xl border border-yellow-400/40 text-yellow-300 shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <h4 className="font-sans font-black text-xs text-yellow-300 uppercase tracking-wider">
                            Biometric Manifest & Seal Audits
                          </h4>
                          <p className="text-xs text-yellow-100/80 leading-relaxed font-sans">
                            Each cargo container is tagged with high-security
                            blockchain seal identifiers, physically verified
                            under supervisor logging to eliminate any transport
                            vulnerability.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start bg-[#182a20]/45 p-4 rounded-2xl border border-yellow-500/25">
                        <div className="p-2.5 bg-yellow-450/15 rounded-xl border border-yellow-400/40 text-yellow-300 shrink-0">
                          <Database className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <h4 className="font-sans font-black text-xs text-yellow-300 uppercase tracking-wider">
                            Weight Discrepancy Ingress Protocols
                          </h4>
                          <p className="text-xs text-yellow-100/80 leading-relaxed font-sans">
                            Dual-axis weighbridge records are synced with
                            billing manifest bills of lading instantly,
                            automatically triggering notifications if any
                            payload discrepancy is flagged.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start bg-[#182a20]/45 p-4 rounded-2xl border border-yellow-500/25">
                        <div className="p-2.5 bg-yellow-450/15 rounded-xl border border-yellow-400/40 text-yellow-300 shrink-0">
                          <Users className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <h4 className="font-sans font-black text-xs text-yellow-300 uppercase tracking-wider">
                            Strategic Localized Partnerships
                          </h4>
                          <p className="text-xs text-yellow-100/80 leading-relaxed font-sans">
                            Close cooperation with local dock crews ensures
                            immediate handoffs and rapid custom clearance,
                            cutting maritime sorting delays by up to 34%
                            annually.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full lg:max-w-[45%] rounded-3xl overflow-hidden border-2 border-yellow-400/40 shadow-2xl relative flex bg-[#162720]">
                    <img
                      src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"
                      alt="Crest Field Crew Harbor Inspection"
                      className="w-full h-auto object-cover aspect-4/3 md:aspect-video lg:aspect-square hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />

                    <div className="absolute bottom-4 left-4 bg-[#111E19]/90 border border-yellow-400/35 backdrop-blur-md p-3 rounded-2xl flex items-center gap-2.5 shadow-lg">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                      </span>
                      <div className="flex flex-col select-none">
                        <span className="text-[7.5px] font-mono tracking-widest text-[#F7E4A1] uppercase font-bold leading-none">
                          Status
                        </span>
                        <span className="text-[10px] font-sans font-black text-white leading-none mt-1">
                          DOCKSIDE INSPECTION IN-PROGRESS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <section
              id="about"
              className="py-20 md:py-24 px-6 max-w-7xl mx-auto flex flex-col gap-16 scroll-mt-14"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#F7E4A1]/40 rounded-3xl -z-10" />
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#A35638]/15 rounded-3xl -z-10" />

                  <div className="rounded-3xl overflow-hidden shadow-md border-2 border-white">
                    <img
                      src="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&q=80&w=1200"
                      alt="Crest Cargo Logistics Operation"
                      referrerPolicy="no-referrer"
                      className="w-full h-80 object-cover"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <span className="text-xs uppercase font-mono tracking-widest text-[#A35638] font-black">
                    About Crest Logistics
                  </span>
                  <h2 className="font-sans font-black text-[#111E19] text-3xl md:text-4xl leading-tight">
                    Delivering To Your Doorstep
                  </h2>
                  <p className="text-stone-600 text-sm font-sans leading-relaxed">
                    Crest Logistics is an international multi-modal shipping
                    organization. Founded conceptually in 25 and expanding
                    rapidly inside West-Central Africa, we establish secure
                    inland heavy transit loops, deep container freighting, and
                    cargo sorting pipelines powered by real-time metadata
                    indexing features.
                  </p>

                  <div className="flex flex-col gap-2.5 mt-2 text-xs font-sans">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#F7E4A1] text-[#111E19] flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </span>
                      <span className="font-extrabold text-[#111E19]">
                        Precision Dry Bulk Sorting
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#F7E4A1] text-[#111E19] flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </span>
                      <span className="font-extrabold text-[#111E19]">
                        Cross-Border Ingress Customs Clearance Protocols
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#F7E4A1] text-[#111E19] flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </span>
                      <span className="font-extrabold text-[#111E19]">
                        Bilateral SMS/WhatsApp Consignee Alert Systems
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "services" && (
            <section
              id="services"
              className="py-20 bg-white border-y border-stone-200/50 px-6 scroll-mt-14"
            >
              <div className="max-w-7xl mx-auto flex flex-col gap-12">
                <div className="text-center max-w-2xl mx-auto">
                  <span className="text-xs uppercase font-mono tracking-widest text-[#A35638] font-black">
                    Global Grids
                  </span>
                  <h2 className="font-sans font-black text-[#111E19] text-3xl mt-2">
                    Comprehensive Solutions For Enterprise
                  </h2>
                  <p className="text-xs text-stone-500 mt-2">
                    No matter the scale of bulk or hazardous cargo, we operate
                    custom pathways to secure delivery.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-[#FAF5E9]/55 border border-stone-200/60 rounded-3xl p-6 flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white text-[#A35638] flex items-center justify-center shadow-2xs border">
                        <Plane className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-sans font-black text-sm text-[#111E19] uppercase tracking-wide">
                          Priority Air Freight
                        </h3>
                        <p className="text-[11px] text-stone-500 font-sans mt-1 leading-normal">
                          Interstate express delivery mapping high-value
                          electronics and refrigerated medical samples
                          seamlessly.
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-[#A35638] font-bold">
                      Priority Global Transit
                    </span>
                  </div>

                  <div className="bg-[#FAF5E9]/55 border border-stone-200/60 rounded-3xl p-6 flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white text-[#A35638] flex items-center justify-center shadow-2xs border">
                        <Ship className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-sans font-black text-sm text-[#111E19] uppercase tracking-wide">
                          Ocean Containers
                        </h3>
                        <p className="text-[11px] text-stone-500 font-sans mt-1 leading-normal">
                          Global freight liners dealing with large raw
                          materials, heavy-duty solar battery arrays, and dry
                          bulk containers.
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-[#A35638] font-bold">
                      International Port Gates
                    </span>
                  </div>

                  <div className="bg-[#FAF5E9]/55 border border-stone-200/60 rounded-3xl p-6 flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white text-[#A35638] flex items-center justify-center shadow-2xs border">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-sans font-black text-sm text-[#111E19] uppercase tracking-wide">
                          Overland Freight
                        </h3>
                        <p className="text-[11px] text-stone-500 font-sans mt-1 leading-normal">
                          Robust heavy duty transport vehicles bridging global
                          hubs across North America, Europe, and West African
                          continental corridors.
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-[#A35638] font-bold">
                      In-Transit Trucking Grid
                    </span>
                  </div>

                  <div className="bg-[#FAF5E9]/55 border border-stone-200/60 rounded-3xl p-6 flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white text-[#A35638] flex items-center justify-center shadow-2xs border">
                        <Warehouse className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-sans font-black text-sm text-[#111E19] uppercase tracking-wide">
                          Climatic Storage
                        </h3>
                        <p className="text-[11px] text-stone-500 font-sans mt-1 leading-normal">
                          Secure thermostatic warehouse zoning ensuring fragile
                          lithium or paint products remain in safe indices.
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-[#A35638] font-bold">
                      Crest Smart Warehouse
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "track" && (
            <section
              id="track"
              className="py-20 px-6 max-w-4xl mx-auto scroll-mt-14"
            >
              <div className="bg-white border border-stone-200/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-7">
                <div className="text-center">
                  <div className="inline-flex p-3 bg-[#FAF5E9] text-[#A35638] rounded-2xl mb-3">
                    <Search className="w-7 h-7 text-[#A35638]" />
                  </div>
                  <h2 className="text-2xl font-sans font-black text-[#111E19] tracking-tight uppercase">
                    Crest Tracking Terminal
                  </h2>
                  <p className="text-xs text-stone-500 font-sans mt-1 max-w-md mx-auto">
                    Verify bilateral bills of lading, current milestone
                    timelines, and packing directives live.
                  </p>
                </div>

                <form
                  onSubmit={(e) => handlePublicTrackSearch(e)}
                  className="flex gap-2 p-1 border border-stone-200 bg-stone-50/50 rounded-2xl font-sans text-xs"
                >
                  <input
                    type="text"
                    placeholder="Enter Track ID (e.g. CR-385901-LT or CR-992104-LT)"
                    className="flex-1 bg-transparent px-4 py-3 placeholder-stone-400 focus:outline-none text-stone-900 text-sm font-sans"
                    value={publicSearchQuery}
                    onChange={(e) => setPublicSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={publicSearching}
                    className="bg-[#111E19] hover:bg-stone-850 text-white font-bold px-6 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    {publicSearching ? "Checking Database..." : "Track Package"}
                  </button>
                </form>

                {publicSearchError && (
                  <div className="bg-rose-50 border border-rose-250 text-rose-800 text-xs text-center px-4 py-3 rounded-xl font-sans font-medium animate-pulse">
                    ⚠ {publicSearchError}
                  </div>
                )}

                {publicFoundShipment && (
                  <div className="border border-stone-200 rounded-3xl p-5 md:p-6 flex flex-col gap-6 font-sans">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-stone-100 gap-3">
                      <div>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                          Waybill Record ID
                        </p>
                        <h3 className="font-sans font-black text-lg text-[#A35638] tracking-tight">
                          {publicFoundShipment.orderId}
                        </h3>
                      </div>
                      <div className="flex flex-col sm:items-end">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                          Current Milestone
                        </span>
                        <span
                          className={`px-3 py-1 bg-amber-50 rounded-full text-xs font-black uppercase inline-block text-center mt-1 border ${
                            publicFoundShipment.status === "MANIFEST_CREATED"
                              ? "bg-stone-100 border-stone-200 text-stone-600"
                              : publicFoundShipment.status === "DRY_BULK_SORTED"
                              ? "bg-amber-50 border-amber-250 text-amber-800"
                              : publicFoundShipment.status ===
                                "GATEWAY_CUSTOMS_HOLD"
                              ? "text-rose-800 bg-rose-50 border-rose-200"
                              : publicFoundShipment.status === "DELIVERED"
                              ? "text-emerald-800 bg-emerald-50 border-emerald-250"
                              : "bg-sky-50 border-sky-200 text-sky-800"
                          }`}
                        >
                          {publicFoundShipment.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-stone-100 text-xs">
                      <div className="flex flex-col gap-3">
                        <h4 className="font-extrabold text-[#111E19]">
                          Recipient & Cargo Sizing
                        </h4>
                        <div className="grid grid-cols-2 gap-2 bg-stone-50/70 p-4 border border-stone-200/50 rounded-2xl">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
                              Consignee
                            </span>
                            <p className="font-bold text-[#111E19] mt-0.5">
                              {publicFoundShipment.customerName}
                            </p>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
                              Weight
                            </span>
                            <p className="font-mono text-[#111E19] mt-0.5">
                              {publicFoundShipment.weight} kg
                            </p>
                          </div>
                          <div className="col-span-2 pt-2 border-t border-stone-200/50">
                            <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
                              Destination Terminal
                            </span>
                            <p className="font-bold text-stone-600 mt-0.5 leading-relaxed">
                              {publicFoundShipment.destination}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <h4 className="font-extrabold text-[#111E19]">
                          Cargotech Packing Checklists
                        </h4>
                        <div className="bg-[#FAF5E9]/50 border border-stone-250 p-4 rounded-2xl flex flex-col gap-2">
                          <p className="text-[9px] font-mono uppercase text-amber-700 font-bold">
                            Cargo manifest lines (
                            {publicFoundShipment.items.length})
                          </p>
                          <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                            {publicFoundShipment.items.map(
                              (it: any, i: number) => (
                                <div
                                  key={i}
                                  className="flex justify-between items-center text-[11px] leading-relaxed"
                                >
                                  <span className="text-stone-700">
                                    {it.name || "Cargo Pack Unit"}
                                  </span>
                                  <span className="font-mono bg-white border border-stone-200 px-1.5 py-0.2 rounded font-bold text-stone-800">
                                    x{it.qty}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                          {publicFoundShipment.fragile && (
                            <span className="bg-rose-50 text-rose-800 border-rose-150 inline-block text-[9px] uppercase font-bold tracking-wider rounded px-2.1 py-0.5 mt-1 border">
                              ⚠️ FRAGILE: High-Security Insulation Checklist
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <TrackingMockMap
                      status={publicFoundShipment.status}
                      origin={publicFoundShipment.origin}
                      destination={publicFoundShipment.destination}
                      transitCheckpoint={publicFoundShipment.transitCheckpoint}
                      carrierName={
                        publicFoundShipment.insights?.suggestedCarrier
                      }
                      orderId={publicFoundShipment.orderId}
                      distanceCovered={publicFoundShipment.distanceCovered}
                      hoursDriven={publicFoundShipment.hoursDriven}
                    />

                    <div className="flex flex-col gap-4">
                      <h4 className="font-black text-[#111E19] uppercase text-xs tracking-wider">
                        Operational Path Milestones
                      </h4>

                      <div className="relative pl-6 flex flex-col gap-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                        {publicFoundShipment.history &&
                          publicFoundShipment.history.map(
                            (hist: any, i: number) => {
                              const isActive =
                                i === publicFoundShipment.history.length - 1;
                              return (
                                <div
                                  key={i}
                                  className="relative flex flex-col gap-1 text-xs"
                                >
                                  <span
                                    className={`absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white flex items-center justify-center ${
                                      isActive
                                        ? "border-[#A35638] scale-110 before:w-1.5 before:h-1.5 before:bg-[#A35638] before:rounded-full"
                                        : "border-stone-400"
                                    }`}
                                  />

                                  <div className="flex justify-between items-baseline flex-col sm:flex-row gap-0.5">
                                    <span
                                      className={`font-mono text-[10px] font-black uppercase ${
                                        isActive
                                          ? "text-[#A35638]"
                                          : "text-stone-500"
                                      }`}
                                    >
                                      {hist.status.replace(/_/g, " ")} —{" "}
                                      {hist.location}
                                    </span>
                                    <span className="text-[9px] text-stone-400 font-mono">
                                      {hist.date}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-stone-600 leading-normal">
                                    {hist.description}
                                  </p>
                                </div>
                              );
                            }
                          )}
                      </div>
                    </div>

                    <div className="bg-[#FAF4E8] rounded-2xl border border-stone-250 p-4 flex flex-col gap-2.5">
                      <h5 className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#A35638] flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#A35638]" />
                        Crest AI Dispatch Assistant Analysis
                      </h5>
                      <p className="text-[11px] font-sans text-stone-700 leading-relaxed italic">
                        &ldquo;Crest AI Agent Dispatch Analysis: Verified
                        waypoint metrics for consignment{" "}
                        {publicFoundShipment.orderId}. Hand-off optimization
                        indicates carrier line:{" "}
                        {publicFoundShipment.insights?.suggestedCarrier ||
                          "DHL Freight"}
                        . Estimated transit window parameter is{" "}
                        {publicFoundShipment.insights?.predictedTransitDays ||
                          "3 days"}
                        . Security risk class evaluated at{" "}
                        {publicFoundShipment.insights?.riskAssessment || "LOW"}.
                        Consignee or customs seals processing is in order. No
                        customer actions required from your side.&rdquo;
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "contact" && (
            <section
              id="contact"
              className="py-20 md:py-24 px-6 max-w-4xl mx-auto scroll-mt-14"
            >
              <div className="bg-white border border-stone-200/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
                <div className="text-center">
                  <span className="text-xs uppercase font-mono tracking-widest text-[#A35638] font-black block">
                    Get a Free Estimate
                  </span>
                  <h2 className="font-sans font-black text-[#111E19] text-2xl md:text-3xl tracking-tight leading-tight mt-1">
                    Connect With A Dispatcher
                  </h2>
                  <p className="text-xs text-stone-500 font-sans mt-1">
                    Receive verified transit schedules, packing containers cost
                    grids, and optimized carrier channels.
                  </p>
                </div>

                {contactSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-6 text-center text-xs font-sans font-medium animate-fadeIn">
                    <span className="text-2xl block mb-2">✓</span>
                    Thank you! Your quote request has been queued. Our dispatch
                    routing desk will reach you via SMS shortly!
                  </div>
                ) : (
                  <form
                    onSubmit={handleContactSubmit}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans"
                  >
                    <div>
                      <label className="block text-stone-500 font-bold mb-1 uppercase tracking-wider text-[10px]">
                        Your Name
                      </label>
                      <input
                        type="text"
                        className="w-full bg-stone-50/50 border border-stone-200 px-3.5 py-2.5 rounded-xl focus:outline-[#A35638]"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-500 font-bold mb-1 uppercase tracking-wider text-[10px]">
                        Your Email
                      </label>
                      <input
                        type="email"
                        className="w-full bg-stone-50/50 border border-stone-200 px-3.5 py-2.5 rounded-xl focus:outline-[#A35638]"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-stone-500 font-bold mb-1 uppercase tracking-wider text-[10px]">
                        Phone Number (For dispatch alerts)
                      </label>
                      <input
                        type="text"
                        className="w-full bg-stone-50/50 border border-stone-200 px-3.5 py-2.5 rounded-xl focus:outline-[#A35638]"
                        value={contactForm.phone}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            phone: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-stone-500 font-bold mb-1 uppercase tracking-wider text-[10px]">
                        Crate Manifest Cargo Properties & Destinations
                      </label>
                      <textarea
                        rows={4}
                        placeholder="e.g. 10x Battery modules going from Douala Port to N'Djamena"
                        className="w-full bg-stone-50/50 border border-stone-200 px-3.5 py-2.5 rounded-xl focus:outline-[#A35638] resize-none"
                        value={contactForm.message}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            message: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="sm:col-span-2 mt-2 bg-[#111E19] hover:bg-stone-850 text-[#F7E4A1] py-3.5 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-md"
                    >
                      Submit Query Request
                    </button>
                  </form>
                )}
              </div>
            </section>
          )}
        </div>
      )}

      <footer className="w-full bg-[#111E19] text-white pt-16 pb-8 px-6 border-t border-stone-900 mt-auto font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 text-[#F7E4A1] p-2 rounded-xl">
                <Ship className="w-5 h-5 text-[#F7E4A1]" />
              </div>
              <span className="font-sans font-black uppercase tracking-wider text-sm">
                CREST <span className="text-[#F7E4A1]">LOGISTICS</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-normal max-w-xs">
              Autonomous logistics algorithms, bilateral communication portals,
              and dry-bulk cargo safety seals.
            </p>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-wider text-xs mb-4 text-[#F7E4A1]">
              Corporate Segments
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-stone-400">
              <span
                className="cursor-pointer hover:underline"
                onClick={() => navigateToSegment("home")}
              >
                Global Home
              </span>
              <span
                className="cursor-pointer hover:underline"
                onClick={() => navigateToSegment("about")}
              >
                Our Mission Chronology
              </span>
              <span
                className="cursor-pointer hover:underline"
                onClick={() => navigateToSegment("services")}
              >
                Freight Solutions Grid
              </span>
              <span
                className="cursor-pointer hover:underline"
                onClick={() => {
                  setActiveTab("track");
                  setIsAdminMode(false);
                }}
              >
                Tracking Console ID Search
              </span>
            </div>
          </div>

          {!forcePublic && !forceAdminLogin && !forceAdminDashboard && (
            <div>
              <h4 className="font-black uppercase tracking-wider text-xs mb-4 text-[#F7E4A1]">
                Enterprise Access
              </h4>
              <div className="flex flex-col gap-2.5 text-xs text-stone-400">
                <button
                  onClick={() => {
                    setIsAdminMode(true);
                  }}
                  className="text-left cursor-pointer hover:underline flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Authorized Portal Login
                </button>
                <span className="text-[11px] text-stone-500">
                  Demo Code PIN: admin2026
                </span>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-black uppercase tracking-wider text-xs mb-4 text-[#F7E4A1]">
              Terminal Check-in
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-1">
              Main Regional Ingress Portal Address:
            </p>
            <p className="text-xs text-emerald-400 font-mono">
              147 Quai du Président Wilson, 13002 Marseille, France
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-stone-500 font-mono gap-4">
          <span>
            © 2026 Crest Logistics International Corp. All legal corporate
            rights reserved.
          </span>
          <div className="flex gap-4 items-center">
            <span>PORT INGRESS: 3000</span>
            <span className="text-emerald-500">● SECURED SSL NETWORK</span>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
        {chatOpen && (
          <div className="w-80 h-96 bg-white border border-stone-200/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
            <div className="bg-[#111E19] text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-white/10 p-1.5 rounded-lg text-[#F7E4A1]">
                  <Zap className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wide">
                    Crest Cog Agent
                  </h4>
                  <p className="text-[9px] text-emerald-400 font-mono leading-none mt-0.5">
                    ONLINE SUPPORT
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-stone-300 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-xs bg-[#FAF5E9]/35">
              {chatHistory.map((item, index) => (
                <div
                  key={index}
                  className={`max-w-[85%] p-3 rounded-2xl flex flex-col gap-1 shadow-2xs ${
                    item.sender === "user"
                      ? "bg-[#111E19] text-white self-end rounded-tr-none text-right"
                      : "bg-white text-stone-800 self-start rounded-tl-none border"
                  }`}
                >
                  <p className="leading-relaxed text-[11px] whitespace-pre-wrap">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {showHandoff && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col gap-2 text-xs font-sans mx-2 mb-2">
                <p className="font-bold text-amber-800">
                  Connect to a live agent?
                </p>
                <div className="flex gap-2">
                  <a
                    href="https://wa.me/+237XXXXXXXXX"
                    target="_blank"
                    className="flex-1 bg-[#25D366] text-white py-2 rounded-lg font-bold text-center text-[10px] uppercase"
                  >
                    💬 WhatsApp
                  </a>

                  <a
                    href="mailto:support@crestlogistics.com"
                    className="flex-1 bg-[#111E19] text-[#F7E4A1] py-2 rounded-lg font-bold text-center text-[10px] uppercase"
                  >
                    ✉️ Email
                  </a>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSendChatMessage}
              className="p-2.5 border-t border-stone-100 flex gap-2 shrink-0 bg-white"
            >
              <input
                type="text"
                placeholder="Write support message..."
                className="flex-1 bg-stone-50 border rounded-xl px-3 text-xs text-stone-900 focus:outline-[#A35638]"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <button
                type="submit"
                className="bg-[#111E19] hover:bg-stone-850 text-[#F7E4A1] p-2 rounded-xl transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-300" />
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-14 h-14 rounded-full bg-[#111E19] text-[#F7E4A1] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          title="Open AI Dispatch Terminal Support Chat"
        >
          <MessageSquare className="w-6 h-6 text-[#F7E4A1]" />
        </button>
      </div>

      {shipmentToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200/80 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans font-black text-sm text-[#111E19] uppercase tracking-wide">
                  Confirm Deletion
                </h3>
                <p className="text-[10px] text-stone-400 font-mono">
                  WAYBILL ID: {shipmentToDelete.orderId}
                </p>
              </div>
            </div>

            <div className="text-xs text-stone-600 font-sans leading-relaxed">
              Are you absolutely sure you want to permanently remove this
              shipment from server records?
              <div className="mt-2.5 bg-stone-50 border border-stone-100/60 rounded-xl p-3 flex flex-col gap-1.5 font-medium text-stone-700">
                <p className="flex justify-between">
                  <span className="text-stone-400 text-[10px]">Customer:</span>
                  <span>{shipmentToDelete.customerName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-stone-400 text-[10px]">
                    Origin Hub:
                  </span>
                  <span className="truncate max-w-[150px]">
                    {shipmentToDelete.origin || "California, USA"}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-stone-400 text-[10px]">
                    Destination:
                  </span>
                  <span className="truncate max-w-[150px]">
                    {shipmentToDelete.destination}
                  </span>
                </p>
              </div>
              <p className="mt-3 text-[10px] text-rose-500 font-semibold">
                * This action is destructive and cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 mt-2">
              <button
                type="button"
                onClick={() => setShipmentToDelete(null)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[10px] py-3.5 rounded-xl transition-all cursor-pointer"
              >
                No, Keep It
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteShipmentFromServer(shipmentToDelete.orderId);
                  setShipmentToDelete(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-wider text-[10px] py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {editingShipment && (
        <div className="fixed inset-0 z-[999] bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto selection:bg-[#F7E4A1]">
          <div className="bg-white border-2 border-[#111E19] md:rounded-3xl rounded-2xl w-full max-w-2xl p-5 md:p-8 flex flex-col gap-6 shadow-2xl animate-scaleIn my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center border border-sky-150 shrink-0">
                  <Database className="w-5 h-5 font-mono font-bold" />
                </div>
                <div>
                  <h3 className="font-sans font-black text-[#111E19] text-base md:text-lg uppercase tracking-tight">
                    Admin Waybill Override
                  </h3>
                  <p className="text-[10px] text-sky-600 font-mono font-bold tracking-wider">
                    CURRENT SHIPMENT ID: {editingShipment.orderId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-stone-400 hover:text-stone-600 text-lg font-bold p-1"
                onClick={() => setEditingShipment(null)}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-[#111E19]">
              <div className="col-span-2">
                <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                  Consignee Client Name
                </label>
                <input
                  type="text"
                  className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3 py-2 text-stone-900 focus:outline-[#A35638]"
                  value={editingShipment.customerName || ""}
                  onChange={(e) =>
                    setEditingShipment({
                      ...editingShipment,
                      customerName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                  Sender Location Address (Origin)
                </label>
                <input
                  type="text"
                  className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3 py-2 text-stone-900 focus:outline-[#A35638]"
                  value={editingShipment.origin || ""}
                  onChange={(e) =>
                    setEditingShipment({
                      ...editingShipment,
                      origin: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                  Receiver Location Address (Destination)
                </label>
                <input
                  type="text"
                  className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3 py-2 text-stone-900 focus:outline-[#A35638]"
                  value={editingShipment.destination || ""}
                  onChange={(e) =>
                    setEditingShipment({
                      ...editingShipment,
                      destination: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                  Package Weight
                </label>
                <div className="flex rounded-xl overflow-hidden border border-stone-300">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    className="flex-1 text-xs font-sans px-3 py-2 bg-white text-stone-900 focus:outline-none"
                    value={
                      editingShipment.packageWeight !== undefined
                        ? editingShipment.packageWeight
                        : editingShipment.weight || ""
                    }
                    onChange={(e) =>
                      setEditingShipment({
                        ...editingShipment,
                        packageWeight: parseFloat(e.target.value) || 0,
                        weight: e.target.value,
                      })
                    }
                  />
                  <select
                    className="bg-stone-50 text-xs font-sans text-stone-700 px-3 focus:outline-none bg-transparent"
                    value={editingShipment.weightUnit || "kg"}
                    onChange={(e: any) =>
                      setEditingShipment({
                        ...editingShipment,
                        weightUnit: e.target.value,
                      })
                    }
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                  Payment Method
                </label>
                <select
                  className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3 py-2 bg-white text-stone-900 focus:outline-none focus:border-[#A35638]"
                  value={editingShipment.paymentMethod || "Credit Card"}
                  onChange={(e) =>
                    setEditingShipment({
                      ...editingShipment,
                      paymentMethod: e.target.value,
                    }) 
                  }
                >
                  <option value="Apple Pay">Apple Pay</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash App">Cash App</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Other methods">Other methods</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                  Physical Dimensions (L x W x H)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 120x80x100 cm"
                  className="w-full text-xs font-sans rounded-xl border border-stone-300 px-3 py-2 text-stone-900 focus:outline-[#A35638]"
                  value={editingShipment.dimensions || ""}
                  onChange={(e) =>
                    setEditingShipment({
                      ...editingShipment,
                      dimensions: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex flex-col justify-center">
                <span className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                  Fragile Classification
                </span>
                <label className="flex items-center gap-2 cursor-pointer font-bold select-none text-[#111E19]">
                  <input
                    type="checkbox"
                    className="rounded text-[#A35638] focus:ring-[#A35638] border-[#A35638]"
                    checked={editingShipment.fragile || false}
                    onChange={(e) =>
                      setEditingShipment({
                        ...editingShipment,
                        fragile: e.target.checked,
                      })
                    }
                  />
                  <span>Mark as Fragile / Hazardous</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-sans font-black uppercase text-stone-500 mb-1">
                  Active Status Milestone
                </label>
                <select
                  className="w-full text-xs font-sans font-semibold rounded-xl border border-stone-300 px-3 py-2 bg-white text-stone-900 focus:outline-none focus:border-[#A35638]"
                  value={editingShipment.status}
                  onChange={(e) =>
                    setEditingShipment({
                      ...editingShipment,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="MANIFEST_CREATED">Manifest Created</option>
                  <option value="DRY_BULK_SORTED">
                    Consolidated &amp; Sorted
                  </option>
                  <option value="IN_OVERLAND_TRANSIT">
                    In Overland Transit
                  </option>
                  <option value="GATEWAY_CUSTOMS_HOLD">
                    Customs Border Hold
                  </option>
                  <option value="DELIVERED">Delivered to Recipient</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 border border-dashed border-stone-250 rounded-xl p-2.5 bg-stone-50 col-span-2">
                <div className="col-span-2 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="block text-[8px] font-sans font-extrabold uppercase text-stone-400">
                    🚗 Operational Overland Progress
                  </span>
                </div>
                <div>
                  <label className="block text-[9px] font-sans font-bold uppercase text-stone-500 mb-0.5">
                    Hours Driven (h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    className="w-full text-xs font-mono rounded-lg border border-stone-300 px-2 py-1.5 bg-white text-stone-900 focus:outline-[#A35638]"
                    value={
                      editingShipment.hoursDriven !== undefined
                        ? editingShipment.hoursDriven
                        : 0
                    }
                    onChange={(e) =>
                      setEditingShipment({
                        ...editingShipment,
                        hoursDriven: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-sans font-bold uppercase text-stone-500 mb-0.5">
                    Distance Covered (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 400"
                    className="w-full text-xs font-mono rounded-lg border border-stone-300 px-2 py-1.5 bg-white text-stone-900 focus:outline-[#A35638]"
                    value={
                      editingShipment.distanceCovered !== undefined
                        ? editingShipment.distanceCovered
                        : 0
                    }
                    onChange={(e) =>
                      setEditingShipment({
                        ...editingShipment,
                        distanceCovered: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-2 pt-2 border-t border-stone-150">
              <button
                type="button"
                onClick={() => setEditingShipment(null)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[10px] py-3.5 rounded-xl transition-all cursor-pointer"
              >
                Discard edits
              </button>
              <button
                type="button"
                disabled={isSavingEdit}
                onClick={async () => {
                  try {
                    setIsSavingEdit(true);

                    const response = await fetch("/api/register-shipment", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        formData: editingShipment,
                      }),
                    });

                    if (!response.ok) {
                      throw new Error(
                        "Failed to edit shipment details on server."
                      );
                    }

                    const resData = await response.json();
                    const updated = resData.shipment;

                    setServerShipments((prev) => {
                      const filtered = prev.filter(
                        (s) => s.orderId !== updated.orderId
                      );
                      return [updated, ...filtered];
                    });

                    if (
                      activeWaybill &&
                      activeWaybill.orderId === updated.orderId
                    ) {
                      setActiveWaybill(updated);
                    }
                    if (
                      lastCreatedDomesticWaybill &&
                      lastCreatedDomesticWaybill.orderId === updated.orderId
                    ) {
                      setLastCreatedDomesticWaybill(updated);
                    }

                    setEditingShipment(null);
                  } catch (err: any) {
                    console.error(err);
                    alert("Failure to update shipment: " + err.message);
                  } finally {
                    setIsSavingEdit(false);
                  }
                }}
                className="bg-[#111E19] text-[#F7E4A1] hover:bg-stone-850 font-bold uppercase tracking-wider text-[10px] py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSavingEdit ? (
                  <>
                    <span className="w-3 h-3 border-2 border-[#F7E4A1] border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-amber-350 hover:animate-spin" />
                    <span>Save Override Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
