"use client";
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePreview, usePreviewSession } from "@/hooks/usePreview";
import { 
  Eye, 
  EyeOff, 
  Clock, 
  User, 
  RefreshCw, 
  AlertTriangle, 
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export const PreviewNotice = () => {
  const { state, exitPreview, refreshPreview, refreshToken } = usePreview();
  const { timeRemaining, isExpired, username, userRoles } = usePreviewSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Don't show if preview is not active
  if (!state.isActive) {
    return null;
  }

  const handleExit = async () => {
    setIsExiting(true);
    try {
      await exitPreview();
    } catch (error) {
      console.error("Failed to exit preview:", error);
      setIsExiting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const success = await refreshToken();
      if (success) {
        refreshPreview();
      }
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format time remaining
  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return "< 1 min";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Get status color and icon
  const getStatusInfo = () => {
    if (state.error) {
      return {
        bgColor: "bg-red-500",
        borderColor: "border-red-600",
        textColor: "text-red-50",
        icon: AlertTriangle,
        status: "Error"
      };
    }
    
    if (isExpired) {
      return {
        bgColor: "bg-orange-500",
        borderColor: "border-orange-600", 
        textColor: "text-orange-50",
        icon: Clock,
        status: "Expired"
      };
    }

    if (state.contentStatus === "private") {
      return {
        bgColor: "bg-purple-500",
        borderColor: "border-purple-600",
        textColor: "text-purple-50", 
        icon: EyeOff,
        status: "Private"
      };
    }

    return {
      bgColor: "bg-yellow-500",
      borderColor: "border-yellow-600",
      textColor: "text-yellow-50",
      icon: Eye,
      status: "Preview"
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <aside className={`fixed top-0 left-0 right-0 z-50 ${statusInfo.bgColor} ${statusInfo.textColor} shadow-lg`}>
      {/* Main preview bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <StatusIcon size={16} className="flex-shrink-0" />
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} border-opacity-50 text-xs font-medium`}
            >
              {statusInfo.status} Mode
            </Badge>
            
            {state.contentType && (
              <span className="text-xs opacity-75 capitalize">
                {state.contentType}
              </span>
            )}
            
            {state.contentId && (
              <span className="text-xs opacity-75">
                ID: {state.contentId}
              </span>
            )}
          </div>

          {/* Time remaining */}
          {timeRemaining > 0 && !isExpired && (
            <div className="flex items-center gap-1 text-xs opacity-75">
              <Clock size={12} />
              {formatTimeRemaining(timeRemaining)}
            </div>
          )}

          {/* Error message */}
          {state.error && (
            <span className="text-xs opacity-90 max-w-xs truncate">
              {state.error}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="ghost"
            size="sm"
            className={`${statusInfo.textColor} hover:bg-black/10 h-7 px-2`}
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
            <span className="ml-1 text-xs">Refresh</span>
          </Button>

          {/* Expand/Collapse button */}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm" 
            className={`${statusInfo.textColor} hover:bg-black/10 h-7 px-2`}
          >
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </Button>

          {/* Exit button */}
          <Button
            onClick={handleExit}
            disabled={isExiting}
            variant="ghost"
            size="sm"
            className={`${statusInfo.textColor} hover:bg-black/10 h-7 px-2`}
          >
            <X size={12} />
            <span className="ml-1 text-xs">
              {isExiting ? "Exiting..." : "Exit"}
            </span>
          </Button>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className={`border-t ${statusInfo.borderColor} border-opacity-20 px-4 py-3 bg-black/5`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* User info */}
            <div className="flex items-center gap-2">
              <User size={12} className="opacity-75" />
              <div>
                <div className="font-medium opacity-90">
                  {username || "Unknown User"}
                </div>
                {userRoles && userRoles.length > 0 && (
                  <div className="opacity-75 text-xs">
                    {userRoles.join(", ")}
                  </div>
                )}
              </div>
            </div>

            {/* Content info */}
            <div>
              <div className="font-medium opacity-90 mb-1">Content Details</div>
              <div className="opacity-75 space-y-1">
                {state.contentStatus && (
                  <div>Status: {state.contentStatus}</div>
                )}
                {state.contentType && (
                  <div>Type: {state.contentType}</div>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div>
              <div className="font-medium opacity-90 mb-1">Permissions</div>
              <div className="opacity-75 space-y-1">
                <div>Edit: {state.canEdit ? "Yes" : "No"}</div>
                <div>Publish: {state.canPublish ? "Yes" : "No"}</div>
              </div>
            </div>
          </div>

          {/* Session info */}
          {state.startTime && (
            <div className="mt-3 pt-3 border-t border-black/10 text-xs opacity-75">
              Session started: {new Date(state.startTime).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
