import type { Owner } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  GwmClient,
  GwmEventType,
  type TilingDirection,
  type Workspace,
} from 'glazewm';

import { getMonitors } from '~/desktop';
import type { GlazewmProviderConfig } from '~/user-config';
import type {
  BindingModeChangedEvent,
  FocusChangedEvent,
  TilingDirectionChangedEvent,
  WorkspaceActivatedEvent,
  WorkspaceDeactivatedEvent,
} from 'glazewm/dist/types/events';

export interface GlazewmVariables {
  workspacesOnMonitor: Workspace[];
  tilingDirection: TilingDirection;
  bindingMode: null | 'string';
}

export async function createGlazewmProvider(
  _: GlazewmProviderConfig,
  __: Owner,
) {
  const { currentMonitor } = await getMonitors();
  const client = new GwmClient();

  const [glazewmVariables, setGlazewmVariables] =
    createStore<GlazewmVariables>({
      workspacesOnMonitor: [],
      tilingDirection: 'horizontal',
      bindingMode: null,
    });

  client.onConnect(e => console.log('onOpen', e));
  client.onMessage(e => console.log('onMessage', e));
  client.onDisconnect(e => console.log('onClose', e));
  client.onError(e => console.log('onError', e));

  // Get initial workspaces.
  await getWorkspacesOnMonitor();

  await client.subscribeMany([GwmEventType.WORKSPACE_ACTIVATED], onEvent);

  await client.subscribeMany(
    [
      GwmEventType.WORKSPACE_ACTIVATED,
      GwmEventType.WORKSPACE_DEACTIVATED,
      GwmEventType.BINDING_MODE_CHANGED,
      GwmEventType.TILING_DIRECTION_CHANGED,
      GwmEventType.FOCUS_CHANGED,
    ],
    onEvent,
  );

  async function onEvent(
    e:
      | WorkspaceActivatedEvent
      | WorkspaceDeactivatedEvent
      | BindingModeChangedEvent
      | TilingDirectionChangedEvent
      | FocusChangedEvent,
  ) {
    switch (e.type) {
      // case GwmEventType.BINDING_MODE_CHANGED: {
      //   e.bindingMode
      //     break;
      // }
      case GwmEventType.FOCUS_CHANGED: {
        console.log('aaaa', e.focusedContainer);
        break;
      }
      case GwmEventType.TILING_DIRECTION_CHANGED: {
        setGlazewmVariables({ tilingDirection: e.newTilingDirection });
        console.log('glazewmVariables', glazewmVariables);
        break;
      }
      // case GwmEventType.WORKSPACE_ACTIVATED:
      //@ts-ignore
      case 'workspace_activated':
      case GwmEventType.WORKSPACE_DEACTIVATED: {
        await getWorkspacesOnMonitor();
      }
    }
  }

  async function getWorkspacesOnMonitor() {
    const monitors = await client.getMonitors();
    const currentPosition = { x: currentMonitor!.x, y: currentMonitor!.y };

    // Get GlazeWM monitor that corresponds to the bar's monitor.
    const monitor = monitors.reduce((a, b) =>
      getDistance(currentPosition, a) < getDistance(currentPosition, b)
        ? a
        : b,
    );

    setGlazewmVariables({ workspacesOnMonitor: monitor.children });
  }

  function getDistance(
    pointA: { x: number; y: number },
    pointB: { x: number; y: number },
  ) {
    return Math.sqrt(
      Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2),
    );
  }

  return {
    get workspacesOnMonitor() {
      return glazewmVariables.workspacesOnMonitor;
    },
    get tilingDirection() {
      return glazewmVariables.tilingDirection;
    },
    get bindingMode() {
      return glazewmVariables.bindingMode;
    },
  };
}
