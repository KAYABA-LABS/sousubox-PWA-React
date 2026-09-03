"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Minus,
  Plus,
  Shield,
  AlertTriangle,
  Users,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import type { DiscoverPool, AvailablePoolDetails } from "@/lib/api";

interface PoolDetailModalProps {
  listItem: DiscoverPool;
  details: AvailablePoolDetails | null;
  isLoadingDetails: boolean;
  detailsError: string | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin: (poolId: string, slots: number) => void;
  isJoining: boolean;
}

export function PoolDetailModal({
  listItem,
  details,
  isLoadingDetails,
  detailsError,
  isOpen,
  onClose,
  onJoin,
  isJoining,
}: PoolDetailModalProps) {
  const [slots, setSlots] = useState(1);
  const [activeTab, setActiveTab] = useState("info");

  const spotsRemaining = details?.spotsRemaining ?? listItem.spotsRemaining;
  const joiningFee = details?.template.joiningFee ?? 0;

  const getFrequencyLabel = (freq: string) => {
    switch (freq?.toUpperCase()) {
      case "DAILY": return "daily";
      case "WEEKLY": return "weekly";
      case "BI_WEEKLY": return "every 2 weeks";
      case "MONTHLY": return "monthly";
      default: return freq?.toLowerCase() || "daily";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">{listItem.template.name}</DialogTitle>
              <p className="text-xs text-gray-500 mt-1">
                {listItem.template.tier} • {getFrequencyLabel(listItem.frequency)}
              </p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-600">{spotsRemaining} spots left</Badge>
          </div>

          {details && !detailsError && (
            <>
              {/* Slot Selector */}
              <div className="mt-4">
                <p className="text-sm text-gray-700 mb-2">How many slots?</p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setSlots(Math.max(1, slots - 1))}
                    disabled={slots <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-2xl font-bold text-gray-900 w-8 text-center">{slots}</span>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setSlots(Math.min(spotsRemaining, slots + 1))}
                    disabled={slots >= spotsRemaining}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  You&apos;ll have {slots} {slots === 1 ? "location" : "locations"} in the rotation and contribute{" "}
                  <span className="text-gray-900 font-medium">
                    GH₵{(listItem.contributionAmount * slots).toFixed(2)} {getFrequencyLabel(listItem.frequency)}
                  </span>
                </p>
              </div>

              {/* Entry Payment Card */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">Entry payment:</span>{" "}
                      <span className="text-amber-600 font-bold">GH₵{joiningFee.toFixed(2)} per slot</span>
                      {" "}— it&apos;s added to your payout when it&apos;s your turn.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Your first contribution is due on the group&apos;s start day.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogHeader>

        {/* Body */}
        {isLoadingDetails && !details && (
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        )}

        {detailsError && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-5 text-center">
            <XCircle className="w-10 h-10 text-amber-600 mb-3" />
            <p className="text-sm text-gray-700 mb-4">{detailsError}</p>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        )}

        {details && !detailsError && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="flex border-b border-gray-200 bg-transparent p-0 h-auto rounded-none">
              {["info", "members", "rules"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className={cn(
                    "flex-1 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-y-auto p-5">
              <TabsContent value="info" className="mt-0">
                <div className="space-y-3">
                  {[
                    ["Pay", getFrequencyLabel(details.frequency)],
                    ["Payout", `GH₵${details.payoutAmount}`],
                    ["Entry Fee", `GH₵${joiningFee.toFixed(2)}`],
                    ["Late Fee", "GH₵0.00"],
                    ["Type", "Public"],
                    ["Cycles", String(details.totalCycles)],
                    ["Started", details.startDate ? new Date(details.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD"],
                  ].map(([label, value], i) => (
                    <div key={label} className={cn("flex justify-between items-center py-2", i < 6 && "border-b border-gray-200")}>
                      <span className="text-sm text-gray-500">{label}</span>
                      <span className="text-sm font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="members" className="mt-0">
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-2">
                    For everyone&apos;s privacy, other members&apos; names and contacts are hidden.
                  </p>
                  <p className="text-xs text-gray-500">Slot numbers are revealed when the group starts.</p>
                  <p className="text-sm text-gray-500 mt-4">
                    {details.currentMemberCount} of {details.template.maxMembers} slots filled
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="rules" className="mt-0">
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Pay GH₵{details.contributionAmount.toFixed(2)} {getFrequencyLabel(details.frequency)}. After every cycle
                      one person receives GH₵{details.payoutAmount.toFixed(2)} payout. The cycle continues
                      until everyone in the group has had their turn.
                    </p>
                  </div>
                  <div className="bg-gray-100 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-semibold text-amber-600">Entry fee:</span>{" "}
                      GH₵{joiningFee.toFixed(2)} per slot is required as insurance against defaults.
                      This fee is returned in your payout when it&apos;s your turn.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        )}

        {/* Footer */}
        {details && !detailsError && (
          <div className="px-5 pb-5 pt-3 border-t border-gray-200">
            <div className="flex items-start gap-2 mb-4">
              <Shield className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-500">
                Submit your ID verification to join. Your payout is only released once you&apos;re fully verified.{" "}
                <a href="/kyc" className="text-emerald-600 underline">Submit your ID</a>
              </p>
            </div>
            <Button
              onClick={() => onJoin(listItem.id, slots)}
              disabled={isJoining}
              className="w-full h-14 bg-[#F5A623] hover:bg-[#E6951A] text-black font-semibold rounded-xl"
            >
              {isJoining ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <><FileText className="w-5 h-5" /> Submit your ID to join</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
