import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import type { HassEntity } from "home-assistant-js-websocket";
import {
  css,
  CSSResult,
  customElement,
  html,
  internalProperty,
  LitElement,
  property,
  TemplateResult,
} from "lit-element";
import { fireEvent } from "../../common/dom/fire_event";
import { createCloseHeading } from "../../components/ha-dialog";
import { BROWSER_SOURCE } from "../../data/media-player";
import type { HomeAssistant } from "../../types";
import type { SelectMediaPlayereDialogParams } from "./show-select-media-source-dialog";

@customElement("hui-dialog-select-media-player")
export class HuiDialogSelectMediaPlayer extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false })
  private _params?: SelectMediaPlayereDialogParams;

  @internalProperty() private _mediaSources: HassEntity[] = [];

  public showDialog(params: SelectMediaPlayereDialogParams): void {
    this._params = params;
    this._mediaSources = [...this._params.mediaSources];
  }

  public closeDialog() {
    this._params = undefined;
    fireEvent(this, "dialog-closed", {dialog: this.localName});
  }

  protected render(): TemplateResult {
    if (!this._params) {
      return html``;
    }

    return html`
      <ha-dialog
        open
        scrimClickAction
        escapeKeyAction
        hideActions
        .heading=${createCloseHeading(
          this.hass,
          this.hass.localize(`ui.components.media-browser.choose_player`)
        )}
        @closed=${this.closeDialog}
      >
        <paper-listbox
          attr-for-selected="itemName"
          @iron-select=${this._selectSource}
          ><paper-item .itemName=${BROWSER_SOURCE}
            >${this.hass.localize(
              "ui.components.media-browser.web-browser"
            )}</paper-item
          >
          ${this._mediaSources.map(
            (source) => html`
              <paper-item .itemName=${source.entity_id}
                >${source.attributes.friendly_name}</paper-item
              >
            `
          )}
        </paper-listbox>
      </ha-dialog>
    `;
  }

  private _selectSource(ev: CustomEvent): void {
    const entityId = ev.detail.item.itemName;
    this._params!.sourceSelectedCallback(entityId);
    this.closeDialog();
  }

  static get styles(): CSSResult {
    return css`
      ha-dialog {
        --dialog-content-padding: 0 24px 20px;
      }
      paper-item {
        cursor: pointer;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-dialog-select-media-player": HuiDialogSelectMediaPlayer;
  }
}