"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  ArrowDown,
  Building2,
  Cog,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/fetch-utils";
import { toNaira, maskPAN, formatCardGroups } from "@/utils/format";
import { extractErrorMessage } from "@/lib/utils";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";
import CardWidget from "@/components/cards/CardWidget";

interface OrchestraCard {
  _id: string;
  status: string;
  cardId: {
    _id: string;
    pan: string;
    expiryDate: string;
    cardProgram?: string;
    bank?: string;
    label?: string;
    nameOnCard?: string;
    color?: string;
    maskedPan?: string;
  } | null;
  selectedFundingSourceId: {
    _id: string;
    pan: string;
    bank?: string;
    label?: string;
    color?: string;
    maskedPan?: string;
  } | null;
}

interface FundingSource {
  _id: string;
  label: string;
  bank?: string | null;
  cardProgram?: string | null;
  color?: string | null;
  pan: string;
  availableBalance: number;
  isSelected: boolean;
}

type PaymentStatus = "idle" | "processing" | "success" | "failure";

const ORCHESTRA_PAN = "4000123456789010";
const ORCHESTRA_EXPIRY = "9912";
const ORCHESTRA_CARD_PROGRAM = "MASTERCARD";
const ORCHESTRA_BANK = "Orchestra";
const ORCHESTRA_LABEL = "Orchestra Universal";
const ORCHESTRA_COLOR = "#4A90e2";
const ORCHESTRA_NAME_ON_CARD = "BENEDICT";

function OrchestrationFlowViz({
  fundingSource,
  amount,
  status,
}: {
  fundingSource: FundingSource | null;
  amount: number | null;
  status: PaymentStatus;
}) {
  if (!fundingSource) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-amber-500" />
        <h3 className="text-xs font-semibold text-slate-900">
          Routing Visualization
        </h3>
        <span className="text-[10px] font-mono text-slate-400 ml-auto">
          Conceptual Flow
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        {/* Orchestra Card */}
        <div className="w-24 h-14 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-600 shadow-md flex flex-col items-center justify-center">
          <p className="text-[8px] text-slate-400 uppercase tracking-widest">
            Orchestra
          </p>
          <p className="text-[7px] text-slate-300 font-mono font-bold">
            4000 1234 5678 9010
          </p>
        </div>

        <ArrowDown size={16} className="text-slate-400" />

        {/* Routing Engine */}
        <div className="w-28 h-8 rounded-lg bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-600 flex items-center justify-center shadow-md">
          <div className="flex items-center gap-1">
            <Cog size={12} className="text-blue-300" />
            <span className="text-[9px] text-blue-200 font-mono font-semibold">
              ROUTING ENGINE
            </span>
          </div>
        </div>

        <ArrowDown size={16} className="text-slate-400" />

        {/* Funding Source */}
        <div
          className="w-32 h-12 rounded-xl border-2 shadow-md flex flex-col items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${fundingSource.color || "#1e293b"} 0%, #0f172a 100%)`,
            borderColor:
              status === "success"
                ? "#10b981"
                : status === "processing"
                  ? "#f59e0b"
                  : "#334155",
          }}
        >
          <p className="text-[8px] text-white/80 uppercase tracking-wider font-medium">
            {fundingSource.bank || fundingSource.label}
          </p>
          <p className="text-[9px] text-white font-mono font-bold tabular-nums">
            {toNaira(fundingSource.availableBalance)}
          </p>
        </div>

        {/* Amount indicator */}
        {status === "success" && amount !== null && (
          <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-medium bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
            <ArrowRight size={10} />
            <span>{toNaira(amount)} deducted</span>
          </div>
        )}

        {status === "processing" && (
          <div className="flex items-center gap-1.5 text-amber-600 text-[10px] font-medium bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
            <Loader2 size={10} className="animate-spin" />
            <span>Processing payment...</span>
          </div>
        )}

        {status === "failure" && (
          <div className="flex items-center gap-1.5 text-rose-600 text-[10px] font-medium bg-rose-50 px-2 py-1 rounded-full border border-rose-200">
            <XCircle size={10} />
            <span>Payment declined</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrchestrationPage() {
  const [orchestraCard, setOrchestraCard] = useState<OrchestraCard | null>(
    null,
  );
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [selectedFundingSourceId, setSelectedFundingSourceId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [merchant, setMerchant] = useState("Demo Store");
  const [amount, setAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [lastPayment, setLastPayment] = useState<{
    amount: number;
    merchant: string;
    fundingSourceName: string;
    balanceBefore: number;
    balanceAfter: number;
    status: string;
    reference: string;
  } | null>(null);

  const [processingStep, setProcessingStep] = useState(0);
  const fundingSourcesSectionRef = useRef<HTMLDivElement | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [cardRes, sourcesRes] = await Promise.all([
        fetchWithAuth("/api/orchestration/card"),
        fetchWithAuth("/api/orchestration/sources"),
      ]);
      if (!cardRes.ok || !sourcesRes.ok) {
        throw new Error("Failed to load orchestration data");
      }
      const cardData = await cardRes.json();
      const sourcesData = await sourcesRes.json();
      if (!Array.isArray(sourcesData.sources)) {
        throw new Error("Invalid funding sources response");
      }
      setOrchestraCard(cardData.card);
      setFundingSources(sourcesData.sources);
      setSelectedFundingSourceId(
        typeof sourcesData.selectedFundingSourceId === "string"
          ? sourcesData.selectedFundingSourceId
          : null,
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function isNumericAmount(val: string) {
    if (!val) return false;
    const cleaned = val.replace(/[,\s]/g, "");
    const num = parseFloat(cleaned);
    return !isNaN(num) && num > 0 && Number.isFinite(num);
  }

  function formatAmountWithCommas(val: string): string {
    const cleaned = val.replace(/[,\s]/g, "");
    if (cleaned === "" || cleaned === ".") return cleaned;
    const [intPart, decPart] = cleaned.split(".");
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
  }

  const numericAmount = parseFloat(amount.replace(/[,\s]/g, "") || "0") || 0;
  const validAmount = isNumericAmount(amount) && numericAmount > 0;
  const selectedSource =
    fundingSources.find((s) => s._id === selectedFundingSourceId) || null;
  const canSimulate = validAmount && selectedSource && paymentStatus === "idle";

  async function handleSelectSource(sourceId: string) {
    if (sourceId === selectedFundingSourceId) return;
    setPaymentStatus("idle");
    try {
      const res = await fetchWithAuth("/api/orchestration/select-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fundingSourceId: sourceId }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrchestraCard(data.card);
        setSelectedFundingSourceId(sourceId);
        setFundingSources((prev) =>
          prev.map((s) => ({ ...s, isSelected: s._id === sourceId })),
        );
        toast.success(
          `Funding source set to ${data.card.selectedFundingSourceId?.bank || data.card.selectedFundingSourceId?.label || "selected account"}`,
        );
      } else {
        const data = await res.json();
        toast.error(extractErrorMessage({ data }));
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleSimulatePayment() {
    if (!canSimulate) return;

    setPaymentStatus("processing");
    setLastPayment(null);
    setProcessingStep(0);

    const amountKobo = Math.round(numericAmount * 100);

    // Simulate processing steps for visual feedback
    const steps = [
      "Validating Orchestra Card",
      "Resolving funding source",
      "Checking balance",
      "Routing payment",
    ];
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    try {
      const res = await fetchWithAuth("/api/orchestration/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountKobo,
          merchant,
          category: "card_payment",
          narration: `Orchestra Universal Card payment to ${merchant}`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPaymentStatus("success");
        setLastPayment({
          amount: data.amount,
          merchant: data.merchant,
          fundingSourceName: data.fundingSourceName,
          balanceBefore: data.balanceBefore,
          balanceAfter: data.balanceAfter,
          status: data.status,
          reference: data.reference,
        });
        toast.success(
          `Payment of ${toNaira(data.amount)} successful — funded by ${data.fundingSourceName}`,
        );
        loadData();
      } else {
        setPaymentStatus("failure");
        toast.error(`Payment declined: ${data.reason}`);
      }
    } catch (err) {
      setPaymentStatus("failure");
      toast.error(extractErrorMessage(err));
    }
  }

  function resetPayment() {
    setPaymentStatus("idle");
    setLastPayment(null);
    setProcessingStep(0);
    setAmount("");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0 pb-12 space-y-6">
      {/* Page Header */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={16} className="text-indigo-500" />
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Orchestra Universal Card
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          One payment interface. Multiple funding sources. Software-controlled
          routing.
        </p>
      </div>

      {/* Orchestra Card Hero */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3">
          <div className="flex items-center gap-2">
            <CreditCard size={15} className="text-indigo-500" />
            <h2 className="text-xs font-semibold text-slate-900">
              Orchestra Card
            </h2>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
              Universal Payment Interface
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 self-start sm:self-auto">
            {orchestraCard?.status === "ACTIVE" ? "● ACTIVE" : "○ INACTIVE"}
          </span>
        </div>

        <div className="max-w-xs mx-auto py-2">
          <CardWidget
            card={{
              _id: "orchestra_card",
              pan: ORCHESTRA_PAN,
              expiryDate: ORCHESTRA_EXPIRY,
              cardProgram: ORCHESTRA_CARD_PROGRAM,
              bank: ORCHESTRA_BANK,
              label: ORCHESTRA_LABEL,
              nameOnCard: ORCHESTRA_NAME_ON_CARD,
              color: ORCHESTRA_COLOR,
              cardStatus: "1",
              isUltimate: false,
            }}
            balance={selectedSource ? selectedSource.availableBalance : 0}
            isSelected={true}
            onClick={() => {}}
            onBlock={() => {}}
            onUnblock={() => {}}
            onDelete={() => {}}
            isDraggable={false}
            hideActions={true}
          />
        </div>
      </section>

      {/* Current Funding Source + Routing Viz */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Current Funding Source */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-emerald-500" />
              <h3 className="text-xs font-semibold text-slate-900">
                Current Funding Source
              </h3>
            </div>
            <button
              type="button"
              onClick={() =>
                fundingSourcesSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Change source
            </button>
          </div>

          <AnimatePresence mode="wait">
            {selectedSource ? (
              <motion.div
                key={selectedSource._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full shadow-xs"
                    style={{ background: selectedSource.color || "#10b981" }}
                  />
                  <p className="font-semibold text-sm text-slate-900">
                    {selectedSource.bank || selectedSource.label}
                  </p>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  {maskPAN(selectedSource.pan)} ·{" "}
                  {selectedSource.cardProgram || "Debit"}
                </p>
                <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-medium text-slate-400">
                    Available
                  </span>
                  <span className="text-base font-mono font-bold text-slate-900 tabular-nums">
                    {toNaira(selectedSource.availableBalance)}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 text-slate-400 text-xs"
              >
                No funding source selected
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Routing Visualization */}
        <OrchestrationFlowViz
          fundingSource={selectedSource}
          amount={lastPayment?.amount ?? null}
          status={paymentStatus}
        />
      </div>

      {/* Funding Sources List */}
      <section
        ref={fundingSourcesSectionRef}
        className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-900">
              Funding Sources
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {fundingSources.length} linked accounts
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 bg-slate-100 animate-pulse rounded-lg border border-slate-200/60"
              />
            ))}
          </div>
        ) : fundingSources.length === 0 ? (
          <div className="p-5 border border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
            <p className="text-xs text-slate-500">
              No funding sources available
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {fundingSources.map((source) => (
              <button
                key={source._id}
                type="button"
                onClick={() => handleSelectSource(source._id)}
                className={cn(
                  "w-full p-3 rounded-xl border text-left transition-all relative flex items-center justify-between shadow-xs",
                  source.isSelected
                    ? "border-slate-900 bg-slate-900 text-white ring-1 ring-slate-900"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-900",
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                      source.isSelected ? "bg-emerald-400" : "bg-slate-300",
                    )}
                  >
                    {source.isSelected ? (
                      <CheckCircle2 size={14} className="text-slate-900" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "font-semibold text-xs truncate",
                        source.isSelected ? "text-white" : "text-slate-900",
                      )}
                    >
                      {source.bank || source.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {source.pan} · {source.cardProgram || "Debit"}
                    </p>
                  </div>
                </div>
                <p
                  className={cn(
                    "text-xs font-mono font-semibold tabular-nums shrink-0",
                    source.isSelected ? "text-emerald-400" : "text-slate-900",
                  )}
                >
                  {toNaira(source.availableBalance)}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Payment Simulation */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} className="text-amber-500" />
          <h3 className="text-xs font-semibold text-slate-900">
            Simulate Payment
          </h3>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
            Sandbox
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1.5 block">
              Merchant
            </label>
            <input
              type="text"
              placeholder="e.g. Demo Store"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1.5 block">
              Amount (NGN)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-slate-400">
                ₦
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                  const parts = cleaned.split(".");
                  const sanitized =
                    parts.length > 2
                      ? parts[0] + "." + parts.slice(1).join("")
                      : cleaned;
                  setAmount(formatAmountWithCommas(sanitized));
                }}
                className="w-full h-10 px-7 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none transition-all tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Funding source indicator */}
        {selectedSource && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/70 mb-4">
            <span className="text-[11px] text-slate-500">
              Funding with:{" "}
              <strong className="text-slate-900">
                {selectedSource.bank || selectedSource.label}
              </strong>
            </span>
            <span className="text-xs font-mono font-semibold text-slate-900 tabular-nums">
              {toNaira(selectedSource.availableBalance)} available
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSimulatePayment}
          disabled={!canSimulate}
          className={cn(
            "w-full h-10 rounded-lg text-white text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-2 shadow-sm",
            paymentStatus === "processing"
              ? "bg-slate-400 cursor-wait"
              : canSimulate
                ? "bg-slate-900 hover:bg-slate-800 hover:shadow"
                : "bg-slate-200 text-slate-400 cursor-not-allowed",
          )}
        >
          {paymentStatus === "processing" ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {[
                "Validating Orchestra Card",
                "Resolving funding source",
                "Checking balance",
                "Routing payment",
              ][processingStep] || "Processing..."}
            </>
          ) : paymentStatus === "success" && lastPayment ? (
            <>
              <CheckCircle2 size={14} className="text-emerald-300" />
              Payment Successful — {toNaira(lastPayment.amount)}
            </>
          ) : paymentStatus === "failure" ? (
            <>
              <XCircle size={14} className="text-rose-300" />
              Payment Declined — Try Again
            </>
          ) : !selectedSource ? (
            "Select a funding source first"
          ) : !validAmount ? (
            "Enter a valid amount"
          ) : (
            `Simulate Payment of ${toNaira(numericAmount * 100)}`
          )}
        </button>
      </section>

      {/* Payment Result */}
      <AnimatePresence>
        {paymentStatus === "success" && lastPayment ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <h3 className="text-sm font-semibold text-emerald-900">
                Payment Successful
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Amount
                </p>
                <p className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                  {toNaira(lastPayment.amount)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Merchant
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {lastPayment.merchant}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Payment Instrument
                </p>
                <p className="text-sm font-medium text-slate-900">
                  Orchestra Card
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Funding Source
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {lastPayment.fundingSourceName}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  {lastPayment.fundingSourceName} Balance
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-400 line-through">
                    {toNaira(lastPayment.balanceBefore)}
                  </span>
                  <ArrowRight size={12} className="text-slate-400" />
                  <span className="text-base font-mono font-bold text-slate-900 tabular-nums">
                    {toNaira(lastPayment.balanceAfter)}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                Ref: {lastPayment.reference.slice(0, 16)}
              </span>
            </div>
            <button
              type="button"
              onClick={resetPayment}
              className="mt-3 w-full py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Make Another Payment
            </button>
          </motion.div>
        ) : paymentStatus === "failure" ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 rounded-xl p-4 sm:p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <XCircle size={16} className="text-rose-600" />
              <h3 className="text-sm font-semibold text-rose-900">
                Payment Declined
              </h3>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-rose-700">
                Insufficient funds in{" "}
                {selectedSource?.bank ||
                  selectedSource?.label ||
                  "selected account"}
                .
              </p>
              {selectedSource && (
                <div className="rounded-lg bg-white border border-slate-200 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500">
                      Available
                    </span>
                    <span className="text-sm font-mono font-semibold text-slate-900 tabular-nums">
                      {toNaira(selectedSource.availableBalance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Required</span>
                    <span className="text-sm font-mono font-semibold text-rose-600 tabular-nums">
                      {toNaira(numericAmount * 100)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={resetPayment}
              className="mt-3 w-full py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Demo Scenarios Guide */}
      <section className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={14} className="text-emerald-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Demo Scenarios
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="font-semibold text-white mb-1">
              Scenario A — Success
            </p>
            <div className="text-slate-400 text-[11px] leading-relaxed space-y-0.5">
              <p>Access Bank: ₦500,000</p>
              <p>Payment: ₦5,000</p>
              <p>Result: ₦495,000 ✓</p>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="font-semibold text-white mb-1">
              Scenario B — Switch Source
            </p>
            <div className="text-slate-400 text-[11px] leading-relaxed space-y-0.5">
              <p>Select GTBank → Pay ₦5,000</p>
              <p>GTBank: ₦500,000 → ₦495,000</p>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="font-semibold text-white mb-1">
              Scenario C — Insufficient
            </p>
            <div className="text-slate-400 text-[11px] leading-relaxed space-y-0.5">
              <p>UBA: ₦10,000</p>
              <p>Payment: ₦50,000</p>
              <p>Result: Declined ✓</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
