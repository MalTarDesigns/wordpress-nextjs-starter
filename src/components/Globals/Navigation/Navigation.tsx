import Link from "next/link";
import { print } from "graphql/language/printer";

import type { MenuItem, RootQueryToMenuItemConnection } from "@/gql/graphql";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { ThemeToggle } from "@/components/theme-toggle";
import gql from "graphql-tag";

async function getData() {
  const menuQuery = gql`
    query MenuQuery {
      menuItems(where: { location: PRIMARY_MENU }) {
        nodes {
          uri
          target
          label
        }
      }
    }
  `;

  const { menuItems } = await fetchGraphQL<{
    menuItems: RootQueryToMenuItemConnection;
  }>(print(menuQuery));

  if (menuItems === null) {
    throw new Error("Failed to fetch data");
  }

  return menuItems;
}

export default async function Navigation() {
  const menuItems = await getData();

  return (
    <nav
      className="flex items-center justify-between p-5 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      itemScope
      itemType="http://schema.org/SiteNavigationElement"
    >
      <div className="flex items-center gap-6">
        {menuItems.nodes.map((item: MenuItem, index: number) => {
          if (!item.uri) return null;

          return (
            <Link
              itemProp="url"
              href={item.uri}
              key={index}
              target={item.target || "_self"}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              <span itemProp="name">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <ThemeToggle />
    </nav>
  );
}
