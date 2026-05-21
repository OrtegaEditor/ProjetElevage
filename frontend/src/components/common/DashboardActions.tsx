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
};
onExport?: () => void;
onRefresh?: () => void;
onNotifications?: () => void;
notificationCount?: number;
isRefreshing?: boolean;
}

export function DashboardActions({
onAdd = {},
onExport,
onRefresh,
onNotifications,
notificationCount = 0,
isRefreshing = false,
}: DashboardActionsProps) {
return (
<div className="flex flex-wrap items-center gap-2">
    <AddButton
    onAddFlock={onAdd.flock}
    onAddSensor={onAdd.sensor}
    onAddHouse={onAdd.house}
    onAddUser={onAdd.user}
    />
    <ExportButton onClick={onExport} />
    <RefreshButton onClick={onRefresh} isLoading={isRefreshing} />
    <NotificationButton count={notificationCount} onClick={onNotifications} />
</div>
);
}