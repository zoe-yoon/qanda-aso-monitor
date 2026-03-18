import React from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "@/components/atoms/Icon";
import { Divider } from "@/components/atoms/Divider";
import { DataSourceLabel } from "@/components/molecules/DataSourceLabel";
import { collectionStatus } from "@/data/mockData";

interface MenuItem {
  label: string;
  icon: string;
  iconFill: string;
  path: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { label: "Overview", icon: "IconHome", iconFill: "IconHomeFill", path: "/" },
  { label: "Keywords", icon: "IconSearch", iconFill: "IconSearch", path: "/keywords", badge: 14 },
  { label: "Suggestions", icon: "IconLightbulb", iconFill: "IconLightbulbFill", path: "/suggestions", badge: 10 },

  { label: "Reports", icon: "IconPage", iconFill: "IconPageFill", path: "/reports" },
];

export const Sidebar: React.FC = () => {
  const sensorTower = collectionStatus.find((s) => s.source === "sensor-tower");

  return (
    <nav className="w-[226px] min-w-[226px] flex flex-col bg-background-card rounded-xl shadow-1 m-3 mr-0 overflow-hidden">
      {/* Header */}
      <div className="p-3 flex items-center gap-2">
        <span className="w-8 h-8 rounded bg-key-background1 flex items-center justify-center text-key-foreground1 text-[14px] font-bold leading-[20px]">
          A
        </span>
        <span className="text-[16px] font-bold leading-[24px] text-foreground-primary">
          ASO Monitor
        </span>
      </div>

      {/* Menu */}
      <div className="flex-1 px-1 flex flex-col gap-[2px]">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded transition-colors
              ${isActive
                ? "bg-key-background2 text-foreground-primary"
                : "text-foreground-tertiary hover:bg-overlay-hover hover:text-foreground-secondary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  name={isActive ? item.iconFill : item.icon}
                  size={20}
                />
                <span className="flex-1 text-[14px] font-semibold leading-[20px]">
                  {item.label}
                </span>
                {item.badge !== undefined && (
                  <span className="text-[12px] font-normal leading-[16px] text-foreground-tertiary">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom */}
      <Divider className="mx-2" />
      <div className="py-2 px-3 flex flex-col gap-2">
        {sensorTower && (
          <DataSourceLabel
            source={sensorTower.source as "sensor-tower"}
            lastUpdated={sensorTower.lastUpdated}
            status={sensorTower.status as "success"}
          />
        )}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded transition-colors
            ${isActive
              ? "bg-key-background2 text-foreground-primary"
              : "text-foreground-tertiary hover:bg-overlay-hover hover:text-foreground-secondary"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon name={isActive ? "IconSettingFill" : "IconSetting"} size={20} />
              <span className="text-[14px] font-semibold leading-[20px]">Settings</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};
