import { createEffect, type Owner } from 'solid-js';
import { createStore } from 'solid-js/store';

import type { KomorebiProviderConfig } from '~/user-config';
import { createProviderListener } from '../create-provider-listener';
import { getMonitors } from '~/desktop';
import { getCoordinateDistance } from '~/utils';

interface KomorebiResponse {
  allMonitors: KomorebiMonitor[];
  focusedMonitorIndex: number;
}

export interface KomorebiProvider {
  /**
   * Workspace displayed on the current monitor.
   */
  displayedWorkspace: KomorebiWorkspace;

  /**
   * Workspace that currently has focus (on any monitor).
   */
  focusedWorkspace: KomorebiWorkspace;

  /**
   * Workspaces on the current monitor.
   */
  currentWorkspaces: KomorebiWorkspace[];

  /**
   * Workspaces across all monitors.
   */
  allWorkspaces: KomorebiWorkspace[];

  /**
   * All monitors.
   */
  allMonitors: KomorebiMonitor[];

  /**
   * Monitor that currently has focus.
   */
  focusedMonitor: KomorebiMonitor;

  /**
   * Monitor that is nearest to this Zebar window.
   */
  currentMonitor: KomorebiMonitor;
}

export interface KomorebiMonitor {
  id: number;
  deviceId: string;
  focusedWorkspaceIndex: number;
  name: string;
  size: KomorebiRect;
  workAreaOffset: number | null;
  workAreaSize: KomorebiRect;
  workspaces: KomorebiWorkspace[];
}

export interface KomorebiWorkspace {
  containerPadding: number | null;
  floatingWindows: KomorebiWindow[];
  focusedContainerIndex: number;
  latestLayout: KomorebiRect[];
  layout: KomorebiLayout;
  layoutFlip: KomorebiLayoutFlip | null;
  maximizedWindow: KomorebiWindow | null;
  monocleContainer: KomorebiContainer | null;
  name: string | null;
  tilingContainers: KomorebiContainer[];
  workspacePadding: number | null;
}

export interface KomorebiContainer {
  id: string;
  windows: KomorebiWindow[];
}

export interface KomorebiWindow {
  class: string | null;
  exe: string | null;
  hwnd: number;
  title: string | null;
}

export interface KomorebiRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export type KomorebiLayout =
  | 'bsp'
  | 'vertical_stack'
  | 'horizontal_stack'
  | 'ultrawide_vertical_stack'
  | 'rows'
  | 'grid'
  | 'custom';

export type KomorebiLayoutFlip =
  | 'horizontal'
  | 'vertical'
  | 'horizontal_and_vertical';

export async function createKomorebiProvider(
  config: KomorebiProviderConfig,
  owner: Owner,
): Promise<KomorebiProvider> {
  const { currentMonitor } = await getMonitors();

  const providerListener = await createProviderListener<
    KomorebiProviderConfig,
    KomorebiResponse
  >(config, owner);

  const [komorebiVariables, setKomorebiVariables] = createStore(
    await getVariables(),
  );

  createEffect(async () => setKomorebiVariables(await getVariables()));

  async function getVariables() {
    const state = providerListener();
    const currentPosition = { x: currentMonitor!.x, y: currentMonitor!.y };

    // Get Komorebi monitor that corresponds to the window's monitor.
    const currentKomorebiMonitor = state.allMonitors.reduce((a, b) =>
      getCoordinateDistance(currentPosition, {
        x: a.workAreaSize.left,
        y: a.workAreaSize.top,
      }) <
      getCoordinateDistance(currentPosition, {
        x: b.workAreaSize.left,
        y: b.workAreaSize.top,
      })
        ? a
        : b,
    );

    const displayedWorkspace =
      currentKomorebiMonitor.workspaces[
        currentKomorebiMonitor.focusedWorkspaceIndex
      ]!;

    const allWorkspaces = state.allMonitors.flatMap(
      monitor => monitor.workspaces,
    );

    const focusedMonitor = state.allMonitors[state.focusedMonitorIndex]!;
    const focusedWorkspace =
      focusedMonitor.workspaces[focusedMonitor.focusedWorkspaceIndex]!;

    return {
      displayedWorkspace,
      focusedWorkspace,
      currentWorkspaces: currentKomorebiMonitor.workspaces,
      allWorkspaces,
      focusedMonitor,
      currentMonitor: currentKomorebiMonitor,
      allMonitors: state.allMonitors,
    };
  }

  return {
    get displayedWorkspace() {
      return komorebiVariables.displayedWorkspace;
    },
    get focusedWorkspace() {
      return komorebiVariables.focusedWorkspace;
    },
    get currentWorkspaces() {
      return komorebiVariables.currentWorkspaces;
    },
    get allWorkspaces() {
      return komorebiVariables.allWorkspaces;
    },
    get allMonitors() {
      return komorebiVariables.allMonitors;
    },
    get focusedMonitor() {
      return komorebiVariables.focusedMonitor;
    },
    get currentMonitor() {
      return komorebiVariables.currentMonitor;
    },
  };
}
