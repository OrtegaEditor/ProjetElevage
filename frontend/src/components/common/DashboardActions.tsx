import React from "react";
import { AddButton } from "./AddButton";
import { ExportButton } from "./ExportButton";
import { RefreshButton } from "./RefreshButton";
import { NotificationButton } from "./NotificationButton";

interface DashboardActionsProps {
onAdd?: {
flock?: () => void;
sensor?: () => void;
house?: () => void;
user?: () => void;
feeding?: () => void;
eggCollecting?: () => void
};
onExport?: () => void;
onRefresh?: () => void;
onNotifications?: () => void;
notificationCount?: number;
isRefreshing?: boolean;
}

export function DashboardActions({
onRefresh,
onNotifications,
notificationCount = 0,
isRefreshing = false,
}: DashboardActionsProps) {
return (
<div className="flex flex-wrap items-center gap-2">
    <RefreshButton onClick={onRefresh} isLoading={isRefreshing} />
    <NotificationButton count={notificationCount} onClick={onNotifications} />
</div>
);
}