import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, Routes } from '@angular/router';
import { routes } from '../../app.routes';

interface SidebarItem {
  id: string;
  label: string;
  route?: string;
  children?: SidebarItem[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  private router = inject(Router);

  readonly menuItems: SidebarItem[] = this.createMenuItems(routes);

  private createMenuItems(routes: Routes): SidebarItem[] {
    const items: SidebarItem[] = [];
    const parentIndex = new Map<string, SidebarItem>();

    const normalizedRoutes = routes
      .filter((route) => route.path && route.path !== '**' && !route.redirectTo && !route.path.includes(':'))
      .map((route) => ({
        path: route.path as string,
        route: `/${route.path}`,
      }));
      console.log('Normalized Routes:', normalizedRoutes);
    for (const route of normalizedRoutes) {
      const segments = route.path.split('/');
      const parentKey = segments[0];
      const childPath = segments.slice(1).join('/');

      if (segments.length === 1) {
        const existing = parentIndex.get(parentKey);
        if (existing) {
          existing.route = route.route;
          existing.label = this.pathToLabel(parentKey);
        } else {
          const item: SidebarItem = {
            id: parentKey,
            label: this.pathToLabel(parentKey),
            route: route.route,
          };
          parentIndex.set(parentKey, item);
          items.push(item);
        }
        continue;
      }

      const childItem: SidebarItem = {
        id: route.path,
        label: this.pathToLabel(childPath),
        route: route.route,
      };

      const parent = parentIndex.get(parentKey);
      if (parent) {
        parent.children = [...(parent.children ?? []), childItem];
        continue;
      }

      const newParent: SidebarItem = {
        id: parentKey,
        label: this.pathToLabel(parentKey),
        route: `/${parentKey}`,
        children: [childItem],
      };
      parentIndex.set(parentKey, newParent);
      items.push(newParent);
    }

    return items;
  }

  private pathToLabel(path: string): string {
    const cleaned = path.replace(/\/?:\w+/g, '').replace(/\//g, ' ');
    return cleaned
      .split(/[-\s]+/)
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  }

  private expandedItems = new Set<string>();

  toggle(item: SidebarItem): void {
    if (!item.children?.length) {
      return;
    }

    if (this.expandedItems.has(item.id)) {
      this.expandedItems.delete(item.id);
      return;
    }

    this.expandedItems.add(item.id);
  }

  isExpanded(item: SidebarItem): boolean {
    return this.expandedItems.has(item.id) || this.isChildActive(item);
  }

  isChildActive(item: SidebarItem): boolean {
    return !!item.children?.some(
      (child) => child.route && this.router.isActive(this.normalizeRoute(child.route), false),
    );
  }

  private normalizeRoute(route: string): string {
    return route.startsWith('/') ? route : `/${route}`;
  }
}
