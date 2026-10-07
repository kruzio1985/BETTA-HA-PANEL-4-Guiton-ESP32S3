Development To-Do List

## 1. Add Browser-Based LVGL LCD Mirroring and Remote Interaction - Done

Integrate the `lcdmirror` ESP-IDF component:

https://github.com/spangap/lcdmirror 
or https://github.com/HASwitchPlate/openHASP

The goal is to expose the physical LVGL LCD through a web browser for development, debugging, testing, and remote interaction.

### Requirements

* Integrate `lcdmirror` into the existing ESP-IDF project without breaking the current LCD, touch, LVGL, networking, or application behavior.
* Mirror the current LVGL/LCD framebuffer to a browser in near real time.
* Allow browser-based interaction with the mirrored display.
* Translate browser mouse/touch events into the existing LVGL touch/input pipeline.
* Support capturing and downloading screenshots of the current LCD display.
* Ensure that local physical touch and browser-generated touch events can coexist safely.
* Minimize RAM, CPU, network bandwidth, and LVGL rendering overhead.
* Keep the mirroring feature modular so that it can be disabled for production builds if required.

### Expected Result

The browser should provide a remote representation of the actual device UI where a developer can:

* View the current LCD screen.
* Click/touch UI controls remotely.
* Navigate through the complete UI.
* Capture screenshots.
* Use those screenshots for UI/UX review and AI-assisted redesign.

---

## 2. Redesign and Polish the Settings Screen - Done

Use the browser-based LCD mirroring capability from Task 1 to establish a screenshot-driven UI improvement workflow.

### Workflow

1. Navigate to the Settings screen through the browser mirror.
2. Capture a screenshot of the current implementation.
3. Provide the screenshot to an AI assistant for UI/UX analysis.
4. Identify visual and usability problems, including:

   * layout
   * spacing
   * typography
   * iconography
   * alignment
   * information hierarchy
   * colors
   * button and control consistency
   * touch-target sizes
   * navigation clarity
5. Generate an improved visual design.
6. Translate the approved design into LVGL components/styles.
7. Capture another screenshot from the actual device.
8. Compare the implementation against the target design.
9. Iterate until the real LVGL implementation closely matches the intended design.

### Constraint

Do not change the underlying Settings functionality or application behavior unless a functional change is explicitly required by the redesigned UX.

---

## 3. Redesign and Polish the Complete Smart Panel UI/UX

Extend the screenshot-driven workflow from Task 2 to the entire product UI.

The target should be a **modern consumer smart-home control panel**, rather than an interface that looks like an engineering or development tool.

Use professional smart-home and control-panel designs for visual inspiration, including:

https://www.zcool.com

### Design Direction

The UI should emphasize:

* Modern and clean visual language.
* Consumer-oriented rather than engineering-oriented presentation.
* Clear information hierarchy.
* Consistent spacing and alignment.
* Consistent typography.
* Consistent icon style.
* Large and comfortable touch targets.
* Smooth navigation between screens.
* Clear device states and feedback.
* Minimal visual clutter.
* Appropriate use of cards, dialogs, switches, sliders, and navigation elements.
* Consistent light/dark theme behavior where applicable.
* Efficient use of the available LCD resolution.

Review and improve major screens individually, such as:

* Home/dashboard
* Rooms
* Lights
* Climate/HVAC
* Curtains/blinds
* Scenes
* Device controls
* Energy/statistics
* Settings
* Network/system configuration
* Home Assistant configuration
* KNX configuration

### Important Constraint

Preserve the existing application architecture, business logic, device behavior, and Home Assistant functionality wherever possible. Treat this primarily as a UI/UX modernization rather than a complete application rewrite.

---

# 4. Add KNX Data Model Alongside the Existing Home Assistant Data Model

Add KNX support while **preserving the current Home Assistant data model and behavior**.

Use the ESP-IDF KNXnet/IP component:

https://github.com/betamoojw/esp32_knx_ip

The architecture should allow Home Assistant and KNX to coexist as independent data sources/backends behind the Smart Panel UI.

Because this is a significant architectural change, implement it incrementally.

## 4.1 Analyze the Existing Home Assistant Architecture

Before modifying the code, document the current data flow:

`Home Assistant → API/Client → Data Model → Application Events → UI/LVGL`

Identify:

* HA client/API classes.
* Entity representation.
* Entity state storage.
* Event/update mechanism.
* UI binding mechanism.
* Commands from UI to HA.
* Initialization and lifecycle.
* Network dependencies.
* Thread/task ownership.
* Persistence/configuration.

The goal is to determine which parts are HA-specific and which can become protocol-independent abstractions.

---

## 4.2 Analyze `esp32_knx_ip`

Review the KNX component and document:

* KNXnet/IP initialization.
* Routing and/or tunneling support.
* Communication Objects.
* Group Addresses.
* DPT/DPST handling.
* Read/write/update callbacks.
* KNX configuration loading.
* Network requirements.
* Event/task architecture.
* Memory ownership and lifetime.

Pay particular attention to:

`KnxParseDpt() → Communication Object → KNX value representation → read path → write path`

---

## 4.3 Define a Protocol-Independent Smart Panel Entity Model

Introduce an abstraction between the UI and protocol-specific implementations.

Target architecture:

```text
                     ┌──────────────────────┐
                     │       LVGL UI        │
                     └──────────┬───────────┘
                                │
                     ┌──────────▼───────────┐
                     │ Smart Panel Model    │
                     │ / Entity Abstraction │
                     └──────────┬───────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
        ┌───────▼────────┐              ┌───────▼────────┐
        │ Home Assistant │              │      KNX       │
        │ Data Model     │              │ Data Model     │
        └───────┬────────┘              └───────┬────────┘
                │                               │
        ┌───────▼────────┐              ┌───────▼────────┐
        │ HA API/Client  │              │  esp32_knx_ip  │
        └────────────────┘              └────────────────┘
```

Avoid making LVGL widgets directly dependent on KNX Group Addresses or HA-specific entity structures.

---

## 4.4 Implement the KNX Data Model

Create KNX-side representations for concepts such as:

* Communication Object
* Group Address
* DPT/DPST
* Current value
* Readable/writable state
* Display name
* Description
* Device/entity type
* Last update
* Availability/state validity

Initially support a small but useful DPT subset, for example:

* DPT 1.x — Boolean / switch
* DPT 5.x — percentage/dimming
* DPT 9.x — 2-byte floating point / temperature
* DPT 12/13/14 — numerical values
* DPT 17/18 — scenes
* DPT 232.600 — RGB colour

Expand DPT coverage incrementally rather than coupling the architecture to a small fixed set.

---

## 4.5 Implement KNX → Model → UI Updates

Implement the incoming path:

```text
KNX Telegram
     ↓
esp32_knx_ip
     ↓
Communication Object
     ↓
DPT Decode
     ↓
KNX Data Model
     ↓
Application Event
     ↓
UI Model
     ↓
LVGL Widget Update
```

Ensure LVGL updates occur safely in the appropriate LVGL/UI execution context.

---

## 4.6 Implement UI → Model → KNX Commands

Implement the outgoing path:

```text
LVGL User Interaction
        ↓
UI Model
        ↓
KNX Entity
        ↓
DPT Encode
        ↓
Communication Object
        ↓
esp32_knx_ip
        ↓
KNXnet/IP Telegram
```

Support common operations first:

* Light ON/OFF
* Dimming
* Temperature/value display
* HVAC values where applicable
* Curtains/blinds
* Scenes
* RGB/RGBW lighting

---

## 4.7 Add KNX Configuration

Provide configuration for mapping Smart Panel entities to KNX Communication Objects.

A configuration should be able to describe concepts similar to:

```json
{
  "id": "living_room_light",
  "name": "Living Room",
  "type": "light",
  "protocol": "knx",
  "state": {
    "group_address": "1/1/1",
    "datapoint_type": "DPST-1-1"
  },
  "command": {
    "group_address": "1/1/2",
    "datapoint_type": "DPST-1-1"
  }
}
```

Keep the configuration extensible for multiple Communication Objects per entity.

---

## 4.8 Support HA and KNX Simultaneously

The final architecture should support configurations such as:

```text
Smart Panel
│
├── Home Assistant
│   ├── Light
│   ├── Climate
│   └── Cover
│
└── KNX
    ├── Light
    ├── Dimmer
    ├── RGB Light
    ├── Climate
    ├── Cover
    └── Scene
```

The UI should not need to know whether an entity originates from Home Assistant or KNX except where protocol-specific configuration is explicitly required.

---

## 4.9 Add KNX Configuration UI

After the underlying KNX architecture is stable, add user-facing configuration screens for:

* Enable/disable KNX.
* KNXnet/IP connection settings.
* Group Address assignment.
* DPT/DPST selection.
* Read/write flags.
* Entity mapping.
* Connection/status information.
* Communication diagnostics.

Keep advanced engineering/debug information separate from normal end-user controls.

---

## 4.10 Testing and Regression Validation

Verify that introducing KNX does not regress existing behavior.

Test at minimum:

* Existing HA connection.
* Existing HA entities.
* Existing UI navigation.
* Physical touch.
* Browser-injected touch.
* LCD mirroring.
* KNX receive.
* KNX transmit.
* KNX Group Read.
* KNX Group Write.
* KNX state synchronization.
* HA + KNX running simultaneously.
* Network reconnect.
* Device reboot.
* Configuration persistence.
* Invalid KNX configuration.
* Unsupported DPT handling.
* Memory usage and leaks.
* LVGL thread safety.

# Recommended Execution Order

**Phase 1:** LCD mirroring → browser touch → screenshots.

**Phase 2:** Settings-screen redesign → screenshot → AI design → LVGL implementation → screenshot validation.

**Phase 3:** Establish the common UI design system → progressively redesign the remaining screens.

**Phase 4:** Analyze existing HA architecture and `esp32_knx_ip` → design the common entity abstraction.

**Phase 5:** Implement KNX model → KNX receive path → KNX command path → configuration.

**Phase 6:** Integrate KNX entities into the existing UI while preserving HA behavior.

**Phase 7:** Add user-friendly KNX configuration UI and complete HA + KNX regression testing.

The key architectural principle is:

**Do not implement KNX as another set of KNX-specific LVGL screens. Instead, separate the UI from the backend protocols so that Home Assistant and KNX can feed the same consumer-oriented Smart Panel UI.**
