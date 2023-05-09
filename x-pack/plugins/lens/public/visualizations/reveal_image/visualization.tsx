/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render } from 'react-dom';
import { i18n } from '@kbn/i18n';
import { ThemeServiceStart } from '@kbn/core/public';
import { KibanaThemeProvider } from '@kbn/kibana-react-plugin/public';
import { I18nProvider } from '@kbn/i18n-react';
import { Ast } from '@kbn/interpreter';
import { buildExpressionFunction, DatatableRow } from '@kbn/expressions-plugin/common';
import {
  Origin,
  ExpressionRevealImageFunctionDefinition,
} from '@kbn/expression-reveal-image-plugin/public';
import { LayerTypes } from '@kbn/expression-xy-plugin/public';
import { Accessors } from '@kbn/expression-gauge-plugin/common';
import type { FormBasedPersistedState } from '../../datasources/form_based/types';
import type {
  DatasourceLayers,
  FramePublicAPI,
  OperationMetadata,
  Suggestion,
  UserMessage,
  Visualization,
} from '../../types';
import { getSuggestions } from './suggestions';
import { GROUP_ID, LENS_REVEAL_IMAGE_ID, RevealImageVisualizationState } from './constants';
import { getAccessorsFromState } from './utils';
import { generateId } from '../../id_generator';

export const elasticLogo =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmlld0JveD0iMCAwIDI3MC42MDAwMSAyNjkuNTQ2NjYiCiAgIGhlaWdodD0iMjY5LjU0NjY2IgogICB3aWR0aD0iMjcwLjYwMDAxIgogICB4bWw6c3BhY2U9InByZXNlcnZlIgogICBpZD0ic3ZnMiIKICAgdmVyc2lvbj0iMS4xIj48bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE4Ij48cmRmOlJERj48Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+PGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+PGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPjwvY2M6V29yaz48L3JkZjpSREY+PC9tZXRhZGF0YT48ZGVmcwogICAgIGlkPSJkZWZzNiIgLz48ZwogICAgIHRyYW5zZm9ybT0ibWF0cml4KDEuMzMzMzMzMywwLDAsLTEuMzMzMzMzMywwLDI2OS41NDY2NykiCiAgICAgaWQ9ImcxMCI+PGcKICAgICAgIHRyYW5zZm9ybT0ic2NhbGUoMC4xKSIKICAgICAgIGlkPSJnMTIiPjxwYXRoCiAgICAgICAgIGlkPSJwYXRoMTQiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgIGQ9Im0gMjAyOS40OCw5NjIuNDQxIGMgMCwxNzAuMDk5IC0xMDUuNDYsMzE4Ljc5OSAtMjY0LjE3LDM3Ni42NTkgNi45OCwzNS44NiAxMC42Miw3MS43MSAxMC42MiwxMDkuMDUgMCwzMTYuMTkgLTI1Ny4yNCw1NzMuNDMgLTU3My40Nyw1NzMuNDMgLTE4NC43MiwwIC0zNTYuNTU4LC04OC41OSAtNDY0LjUzLC0yMzcuODUgLTUzLjA5LDQxLjE4IC0xMTguMjg1LDYzLjc1IC0xODYuMzA1LDYzLjc1IC0xNjcuODM2LDAgLTMwNC4zODMsLTEzNi41NCAtMzA0LjM4MywtMzA0LjM4IDAsLTM3LjA4IDYuNjE3LC03Mi41OCAxOS4wMzEsLTEwNi4wOCBDIDEwOC40ODgsMTM4MC4wOSAwLDEyMjcuODkgMCwxMDU4Ljg4IDAsODg3LjkxIDEwNS45NzcsNzM4LjUzOSAyNjUuMzk4LDY4MS4wOSBjIC02Ljc2OSwtMzUuNDQyIC0xMC40NiwtNzIuMDIgLTEwLjQ2LC0xMDkgQyAyNTQuOTM4LDI1Ni42MjEgNTExLjU2NiwwIDgyNy4wMjcsMCAxMDEyLjIsMCAxMTgzLjk0LDg4Ljk0MTQgMTI5MS4zLDIzOC44MzIgYyA1My40NSwtNDEuOTYxIDExOC44LC02NC45OTIgMTg2LjU2LC02NC45OTIgMTY3LjgzLDAgMzA0LjM4LDEzNi40OTIgMzA0LjM4LDMwNC4zMzIgMCwzNy4wNzggLTYuNjIsNzIuNjI5IC0xOS4wMywxMDYuMTI5IDE1Ny43OCw1Ni44NzkgMjY2LjI3LDIwOS4xMjkgMjY2LjI3LDM3OC4xNCIgLz48cGF0aAogICAgICAgICBpZD0icGF0aDE2IgogICAgICAgICBzdHlsZT0iZmlsbDojZmFjZjA5O2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICBkPSJtIDc5Ny44OTgsMTE1MC45MyA0NDQuMDcyLC0yMDIuNDUgNDQ4LjA1LDM5Mi41OCBjIDYuNDksMzIuMzkgOS42Niw2NC42NyA5LjY2LDk4LjQ2IDAsMjc2LjIzIC0yMjQuNjgsNTAwLjk1IC01MDAuOSw1MDAuOTUgLTE2NS4yNCwwIC0zMTkuMzcsLTgxLjM2IC00MTMuMDUzLC0yMTcuNzkgbCAtNzQuNTI0LC0zODYuNjQgODYuNjk1LC0xODUuMTEiIC8+PHBhdGgKICAgICAgICAgaWQ9InBhdGgxOCIKICAgICAgICAgc3R5bGU9ImZpbGw6IzQ5YzFhZTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgZD0ibSAzMzguMjIzLDY4MC42NzIgYyAtNi40ODksLTMyLjM4MyAtOS44MDksLTY1Ljk4MSAtOS44MDksLTk5Ljk3MyAwLC0yNzYuOTI5IDIyNS4zMzYsLTUwMi4yNTc2IDUwMi4zMTMsLTUwMi4yNTc2IDE2Ni41OTMsMCAzMjEuNDczLDgyLjExNzYgNDE1LjAxMywyMTkuOTQ5NiBsIDczLjk3LDM4NS4zNDcgLTk4LjcyLDE4OC42MjEgTCA3NzUuMTU2LDEwNzUuNTcgMzM4LjIyMyw2ODAuNjcyIiAvPjxwYXRoCiAgICAgICAgIGlkPSJwYXRoMjAiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNlZjI5OWI7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgIGQ9Im0gMzM1LjQxLDE0NDkuMTggMzA0LjMzMiwtNzEuODYgNjYuNjgsMzQ2LjAyIGMgLTQxLjU4NiwzMS43OCAtOTIuOTMsNDkuMTggLTE0NS43MzEsNDkuMTggLTEzMi4yNSwwIC0yMzkuODEyLC0xMDcuNjEgLTIzOS44MTIsLTIzOS44NyAwLC0yOS4yMSA0Ljg3OSwtNTcuMjIgMTQuNTMxLC04My40NyIgLz48cGF0aAogICAgICAgICBpZD0icGF0aDIyIgogICAgICAgICBzdHlsZT0iZmlsbDojNGNhYmU0O2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICBkPSJNIDMwOC45OTIsMTM3Ni43IEMgMTczLjAyLDEzMzEuNjQgNzguNDgwNSwxMjAxLjMgNzguNDgwNSwxMDU3LjkzIDc4LjQ4MDUsOTE4LjM0IDE2NC44Miw3OTMuNjggMjk0LjQwNiw3NDQuMzUyIGwgNDI2Ljk4MSwzODUuOTM4IC03OC4zOTUsMTY3LjUxIC0zMzQsNzguOSIgLz48cGF0aAogICAgICAgICBpZD0icGF0aDI0IgogICAgICAgICBzdHlsZT0iZmlsbDojODVjZTI2O2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICBkPSJtIDEzMjMuOCwyOTguNDEgYyA0MS43NCwtMzIuMDkgOTIuODMsLTQ5LjU5IDE0NC45OCwtNDkuNTkgMTMyLjI1LDAgMjM5LjgxLDEwNy41NTkgMjM5LjgxLDIzOS44MjEgMCwyOS4xNiAtNC44OCw1Ny4xNjggLTE0LjUzLDgzLjQxOCBsIC0zMDQuMDgsNzEuMTYgLTY2LjE4LC0zNDQuODA5IiAvPjxwYXRoCiAgICAgICAgIGlkPSJwYXRoMjYiCiAgICAgICAgIHN0eWxlPSJmaWxsOiMzMTc3YTc7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgIGQ9Im0gMTM4NS42Nyw3MjIuOTMgMzM0Ljc2LC03OC4zMDEgYyAxMzYuMDIsNDQuOTYxIDIzMC41NiwxNzUuMzUxIDIzMC41NiwzMTguNzYyIDAsMTM5LjMzOSAtODYuNTQsMjYzLjg1OSAtMjE2LjM4LDMxMy4wMzkgbCAtNDM3Ljg0LC0zODMuNTkgODguOSwtMTY5LjkxIiAvPjwvZz48L2c+PC9zdmc+';

export const elasticOutline =
  'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3Csvg%20viewBox%3D%22-3.948730230331421%20-1.7549896240234375%20245.25946044921875%20241.40370178222656%22%20width%3D%22245.25946044921875%22%20height%3D%22241.40370178222656%22%20style%3D%22enable-background%3Anew%200%200%20686.2%20235.7%3B%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3Cstyle%20type%3D%22text%2Fcss%22%3E%0A%09.st0%7Bfill%3A%232D2D2D%3B%7D%0A%3C%2Fstyle%3E%0A%20%20%3C%2Fdefs%3E%0A%20%20%3Cg%20transform%3D%22matrix%281%2C%200%2C%200%2C%201%2C%200%2C%200%29%22%3E%0A%20%20%20%20%3Cg%3E%0A%20%20%20%20%20%20%3Cpath%20class%3D%22st0%22%20d%3D%22M329.4%2C160.3l4.7-0.5l0.3%2C9.6c-12.4%2C1.7-23%2C2.6-31.8%2C2.6c-11.7%2C0-20-3.4-24.9-10.2%26%2310%3B%26%239%3B%26%239%3B%26%239%3Bc-4.9-6.8-7.3-17.4-7.3-31.7c0-28.6%2C11.4-42.9%2C34.1-42.9c11%2C0%2C19.2%2C3.1%2C24.6%2C9.2c5.4%2C6.1%2C8.1%2C15.8%2C8.1%2C28.9l-0.7%2C9.3h-53.8%26%2310%3B%26%239%3B%26%239%3B%26%239%3Bc0%2C9%2C1.6%2C15.7%2C4.9%2C20c3.3%2C4.3%2C8.9%2C6.5%2C17%2C6.5C312.8%2C161.2%2C321.1%2C160.9%2C329.4%2C160.3z%20M325%2C124.9c0-10-1.6-17.1-4.8-21.2%26%2310%3B%26%239%3B%26%239%3B%26%239%3Bc-3.2-4.1-8.4-6.2-15.6-6.2c-7.2%2C0-12.7%2C2.2-16.3%2C6.5c-3.6%2C4.3-5.5%2C11.3-5.6%2C20.9H325z%22%2F%3E%0A%20%20%20%20%20%20%3Cpath%20class%3D%22st0%22%20d%3D%22M354.3%2C171.4V64h12.2v107.4H354.3z%22%2F%3E%0A%20%20%20%20%20%20%3Cpath%20class%3D%22st0%22%20d%3D%22M443.5%2C113.5v41.1c0%2C4.1%2C10.1%2C3.9%2C10.1%2C3.9l-0.6%2C10.8c-8.6%2C0-15.7%2C0.7-20-3.4c-9.8%2C4.3-19.5%2C6.1-29.3%2C6.1%26%2310%3B%26%239%3B%26%239%3B%26%239%3Bc-7.5%2C0-13.2-2.1-17.1-6.4c-3.9-4.2-5.9-10.3-5.9-18.3c0-7.9%2C2-13.8%2C6-17.5c4-3.7%2C10.3-6.1%2C18.9-6.9l25.6-2.4v-7%26%2310%3B%26%239%3B%26%239%3B%26%239%3Bc0-5.5-1.2-9.5-3.6-11.9c-2.4-2.4-5.7-3.6-9.8-3.6l-32.1%2C0V87.2h31.3c9.2%2C0%2C15.9%2C2.1%2C20.1%2C6.4C441.4%2C97.8%2C443.5%2C104.5%2C443.5%2C113.5%26%2310%3B%26%239%3B%26%239%3B%26%239%3Bz%20M393.3%2C146.7c0%2C10%2C4.1%2C15%2C12.4%2C15c7.4%2C0%2C14.7-1.2%2C21.8-3.7l3.7-1.3v-26.9l-24.1%2C2.3c-4.9%2C0.4-8.4%2C1.8-10.6%2C4.2%26%2310%3B%26%239%3B%26%239%3B%26%239%3BC394.4%2C138.7%2C393.3%2C142.2%2C393.3%2C146.7z%22%2F%3E%0A%20%20%20%20%20%20%3Cpath%20class%3D%22st0%22%20d%3D%22M491.2%2C98.2c-11.8%2C0-17.8%2C4.1-17.8%2C12.4c0%2C3.8%2C1.4%2C6.5%2C4.1%2C8.1c2.7%2C1.6%2C8.9%2C3.2%2C18.6%2C4.9%26%2310%3B%26%239%3B%26%239%3B%26%239%3Bc9.7%2C1.7%2C16.5%2C4%2C20.5%2C7.1c4%2C3%2C6%2C8.7%2C6%2C17.1c0%2C8.4-2.7%2C14.5-8.1%2C18.4c-5.4%2C3.9-13.2%2C5.9-23.6%2C5.9c-6.7%2C0-29.2-2.5-29.2-2.5%26%2310%3B%26%239%3B%26%239%3B%26%239%3Bl0.7-10.6c12.9%2C1.2%2C22.3%2C2.2%2C28.6%2C2.2c6.3%2C0%2C11.1-1%2C14.4-3c3.3-2%2C5-5.4%2C5-10.1c0-4.7-1.4-7.9-4.2-9.6c-2.8-1.7-9-3.3-18.6-4.8%26%2310%3B%26%239%3B%26%239%3B%26%239%3Bc-9.6-1.5-16.4-3.7-20.4-6.7c-4-2.9-6-8.4-6-16.3c0-7.9%2C2.8-13.8%2C8.4-17.6c5.6-3.8%2C12.6-5.7%2C20.9-5.7c6.6%2C0%2C29.6%2C1.7%2C29.6%2C1.7%26%2310%3B%26%239%3B%26%239%3B%26%239%3Bv10.7C508.1%2C99%2C498.2%2C98.2%2C491.2%2C98.2z%22%2F%3E%0A%20%20%20%20%20%20%3Cpath%20class%3D%22st0%22%20d%3D%22M581.7%2C99.5h-25.9v39c0%2C9.3%2C0.7%2C15.5%2C2%2C18.4c1.4%2C2.9%2C4.6%2C4.4%2C9.7%2C4.4l14.5-1l0.8%2C10.1%26%2310%3B%26%239%3B%26%239%3B%26%239%3Bc-7.3%2C1.2-12.8%2C1.8-16.6%2C1.8c-8.5%2C0-14.3-2.1-17.6-6.2c-3.3-4.1-4.9-12-4.9-23.6V99.5h-11.6V88.9h11.6V63.9h12.1v24.9h25.9V99.5z%22%2F%3E%0A%20%20%20%20%20%20%3Cpath%20class%3D%22st0%22%20d%3D%22M598.7%2C78.4V64.3h12.2v14.2H598.7z%20M598.7%2C171.4V88.9h12.2v82.5H598.7z%22%2F%3E%0A%20%20%20%20%20%20%3Cpath%20class%3D%22st0%22%20d%3D%22M663.8%2C87.2c3.6%2C0%2C9.7%2C0.7%2C18.3%2C2l3.9%2C0.5l-0.5%2C9.9c-8.7-1-15.1-1.5-19.2-1.5c-9.2%2C0-15.5%2C2.2-18.8%2C6.6%26%2310%3B%26%239%3B%26%239%3B%26%239%3Bc-3.3%2C4.4-5%2C12.6-5%2C24.5c0%2C11.9%2C1.5%2C20.2%2C4.6%2C24.9c3.1%2C4.7%2C9.5%2C7%2C19.3%2C7l19.2-1.5l0.5%2C10.1c-10.1%2C1.5-17.7%2C2.3-22.7%2C2.3%26%2310%3B%26%239%3B%26%239%3B%26%239%3Bc-12.7%2C0-21.5-3.3-26.3-9.8c-4.8-6.5-7.3-17.5-7.3-33c0-15.5%2C2.6-26.4%2C7.8-32.6C643%2C90.4%2C651.7%2C87.2%2C663.8%2C87.2z%22%2F%3E%0A%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%3Cpath%20class%3D%22st0%22%20d%3D%22M236.6%2C123.5c0-19.8-12.3-37.2-30.8-43.9c0.8-4.2%2C1.2-8.4%2C1.2-12.7C207%2C30%2C177%2C0%2C140.2%2C0%26%2310%3B%26%239%3B%26%239%3BC118.6%2C0%2C98.6%2C10.3%2C86%2C27.7c-6.2-4.8-13.8-7.4-21.7-7.4c-19.6%2C0-35.5%2C15.9-35.5%2C35.5c0%2C4.3%2C0.8%2C8.5%2C2.2%2C12.4%26%2310%3B%26%239%3B%26%239%3BC12.6%2C74.8%2C0%2C92.5%2C0%2C112.2c0%2C19.9%2C12.4%2C37.3%2C30.9%2C44c-0.8%2C4.1-1.2%2C8.4-1.2%2C12.7c0%2C36.8%2C29.9%2C66.7%2C66.7%2C66.7%26%2310%3B%26%239%3B%26%239%3Bc21.6%2C0%2C41.6-10.4%2C54.1-27.8c6.2%2C4.9%2C13.8%2C7.6%2C21.7%2C7.6c19.6%2C0%2C35.5-15.9%2C35.5-35.5c0-4.3-0.8-8.5-2.2-12.4%26%2310%3B%26%239%3B%26%239%3BC223.9%2C160.9%2C236.6%2C143.2%2C236.6%2C123.5z%20M91.6%2C34.8c10.9-15.9%2C28.9-25.4%2C48.1-25.4c32.2%2C0%2C58.4%2C26.2%2C58.4%2C58.4%26%2310%3B%26%239%3B%26%239%3Bc0%2C3.9-0.4%2C7.7-1.1%2C11.5l-52.2%2C45.8L93%2C101.5L82.9%2C79.9L91.6%2C34.8z%20M65.4%2C29c6.2%2C0%2C12.1%2C2%2C17%2C5.7l-7.8%2C40.3l-35.5-8.4%26%2310%3B%26%239%3B%26%239%3Bc-1.1-3.1-1.7-6.3-1.7-9.7C37.4%2C41.6%2C49.9%2C29%2C65.4%2C29z%20M9.1%2C112.3c0-16.7%2C11-31.9%2C26.9-37.2L75%2C84.4l9.1%2C19.5l-49.8%2C45%26%2310%3B%26%239%3B%26%239%3BC19.2%2C143.1%2C9.1%2C128.6%2C9.1%2C112.3z%20M145.2%2C200.9c-10.9%2C16.1-29%2C25.6-48.4%2C25.6c-32.3%2C0-58.6-26.3-58.6-58.5c0-4%2C0.4-7.9%2C1.1-11.7%26%2310%3B%26%239%3B%26%239%3Bl50.9-46l52%2C23.7l11.5%2C22L145.2%2C200.9z%20M171.2%2C206.6c-6.1%2C0-12-2-16.9-5.8l7.7-40.2l35.4%2C8.3c1.1%2C3.1%2C1.7%2C6.3%2C1.7%2C9.7%26%2310%3B%26%239%3B%26%239%3BC199.2%2C194.1%2C186.6%2C206.6%2C171.2%2C206.6z%20M200.5%2C160.5l-39-9.1l-10.4-19.8l51-44.7c15.1%2C5.7%2C25.2%2C20.2%2C25.2%2C36.5%26%2310%3B%26%239%3B%26%239%3BC227.4%2C140.1%2C216.4%2C155.3%2C200.5%2C160.5z%22%2F%3E%0A%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E';

export const revealImageIcon = 'image';
export const revealImageId = 'revealImage';

function getNiceNumber(localRange: number) {
  const exponent = Math.floor(Math.log10(localRange));
  const fraction = localRange / Math.pow(10, exponent);
  let niceFraction = 10;

  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;

  return niceFraction * Math.pow(10, exponent);
}

// returns nice rounded numbers similar to d3 nice() function
function getNiceRange(min: number, max: number) {
  const maxTicks = 5;
  const offsetMax = max + 0.0000001; // added to avoid max value equal to metric value
  const range = getNiceNumber(offsetMax - min);
  const tickSpacing = getNiceNumber(range / (maxTicks - 1));
  return {
    min: Math.floor(min / tickSpacing) * tickSpacing,
    max: Math.ceil(Math.ceil(offsetMax / tickSpacing) * tickSpacing),
  };
}

export const getMaxValue = (
  row?: DatatableRow,
  accessors?: Accessors,
  isRespectRanges?: boolean
): number => {
  const FALLBACK_VALUE = 100;
  const currentValue = accessors?.max ? getValueFromAccessor(accessors.max, row) : undefined;
  if (currentValue !== undefined && currentValue !== null) {
    return currentValue;
  }

  if (isRespectRanges) {
    const metricValue = accessors?.metric ? getValueFromAccessor(accessors.metric, row) : undefined;
    return metricValue;
  }

  if (row && accessors) {
    const { metric, goal } = accessors;
    const metricValue = metric && row[metric];
    const goalValue = goal && row[goal];
    const minValue = 0;
    if (metricValue != null) {
      const numberValues = [minValue, goalValue, metricValue].filter((v) => typeof v === 'number');
      const maxValue = Math.max(...numberValues);
      return getNiceRange(minValue, maxValue).max;
    }
  }
  return FALLBACK_VALUE;
};

export const getValueFromAccessor = (
  accessor: string,
  row?: DatatableRow
): DatatableRow[string] | number | undefined => {
  if (!row || !accessor) return;

  const value = accessor && row[accessor];
  if (value === null || (Array.isArray(value) && !value.length)) {
    return;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (Array.isArray(value) && typeof value[value.length - 1] === 'number') {
    return value[value.length - 1];
  }
};

const groupLabelForRevealImage = i18n.translate('xpack.lens.metric.groupLabel', {
  defaultMessage: 'Goal and single value',
});

interface RevealImageVisualizationDeps {
  theme: ThemeServiceStart;
}

const isNumericMetric = (op: OperationMetadata) => !op.isBucketed && op.dataType === 'number';

const isNumericDynamicMetric = (op: OperationMetadata) => isNumericMetric(op) && !op.isStaticValue;

const CHART_NAMES = {
  revealImage: {
    icon: revealImageIcon,
    label: i18n.translate('xpack.lens.revealImage.revealImageLabel', {
      defaultMessage: 'Reveal image',
    }),
    groupLabel: groupLabelForRevealImage,
  },
};

const getErrorMessages = (
  row?: DatatableRow,
  state?: RevealImageVisualizationState
): UserMessage[] => {
  if (!row || !state) {
    return [];
  }

  const errors: UserMessage[] = [];

  // const imageAccessor = state?.imageAccessor;
  // const emptyImageAccessor = state?.emptyImageAccessor;
  // const minValue = imageAccessor ? getValueFromAccessor(imageAccessor, row) : undefined;
  // const maxValue = emptyImageAccessor ? getValueFromAccessor(emptyImageAccessor, row) : undefined;
  // if (maxValue !== null && maxValue !== undefined && minValue != null && minValue !== undefined) {
  //   if (maxValue < minValue) {
  //     errors.push({
  //       severity: 'error',
  //       displayLocations: [
  //         { id: 'dimensionButton', dimensionId: imageAccessor! },
  //         { id: 'dimensionButton', dimensionId: emptyImageAccessor! },
  //       ],
  //       fixableInEditor: true,
  //       shortMessage: i18n.translate(
  //         'xpack.lens.guageVisualization.chartCannotRenderMinGreaterMax',
  //         {
  //           defaultMessage: 'Minimum value may not be greater than maximum value',
  //         }
  //       ),
  //       longMessage: '',
  //     });
  //   }
  //   if (maxValue === minValue) {
  //     errors.push({
  //       severity: 'error',
  //       displayLocations: [
  //         { id: 'dimensionButton', dimensionId: imageAccessor! },
  //         { id: 'dimensionButton', dimensionId: emptyImageAccessor! },
  //       ],
  //       fixableInEditor: true,
  //       shortMessage: i18n.translate('xpack.lens.guageVisualization.chartCannotRenderEqual', {
  //         defaultMessage: 'Minimum and maximum values may not be equal',
  //       }),
  //       longMessage: '',
  //     });
  //   }
  // }

  return errors;
};

const toExpression = (
  state: RevealImageVisualizationState,
  datasourceLayers: DatasourceLayers,
  attributes?: unknown,
  datasourceExpressionsByLayers: Record<string, Ast> | undefined = {}
): Ast | null => {
  const datasource = datasourceLayers[state.layerId];
  const datasourceExpression = datasourceExpressionsByLayers[state.layerId];

  const originalOrder = datasource?.getTableSpec().map(({ columnId }) => columnId);
  if (!originalOrder || !state.metricAccessor) {
    return null;
  }

  const revealImageFn = buildExpressionFunction<ExpressionRevealImageFunctionDefinition>(
    'revealImage',
    {
      image: state.image ?? elasticLogo,
      emptyImage: state.emptyImage ?? elasticOutline,
      origin: state.origin ?? Origin.BOTTOM,
    }
  );

  const mathFn = buildExpressionFunction('math', {
    expression: `"${state.metricAccessor}"${state.maxAccessor ? `/"${state.maxAccessor}"` : ''}`,
  });

  return {
    type: 'expression',
    chain: [...(datasourceExpression?.chain ?? []), mathFn.toAst(), revealImageFn.toAst()],
  };
};

export const getRevealImageVisualization = ({
  theme,
}: RevealImageVisualizationDeps): Visualization<RevealImageVisualizationState> => ({
  id: LENS_REVEAL_IMAGE_ID,

  visualizationTypes: [
    {
      ...CHART_NAMES.revealImage,
      id: revealImageId,
      showExperimentalBadge: true,
    },
  ],
  getVisualizationTypeId(state) {
    return revealImageId;
  },
  getLayerIds(state) {
    return [state.layerId];
  },
  clearLayer(state) {
    const newState = { ...state };
    delete newState.metricAccessor;
    delete newState.maxAccessor;
    return newState;
  },

  getDescription(state) {
    return CHART_NAMES.revealImage;
  },

  initialize(addNewLayer, state) {
    return (
      state || {
        layerId: addNewLayer(),
        layerType: LayerTypes.DATA,
        image: elasticLogo,
        emptyImage: elasticLogo,
        origin: Origin.BOTTOM,
      }
    );
  },
  getSuggestions,

  getConfiguration({ state, frame }) {
    const row = state?.layerId ? frame?.activeData?.[state?.layerId]?.rows?.[0] : undefined;
    const { metricAccessor, accessors } = getConfigurationAccessorsAndPalette(
      state,
      frame.activeData
    );

    return {
      groups: [
        {
          enableFormatSelector: true,
          layerId: state.layerId,
          groupId: GROUP_ID.METRIC,
          groupLabel: i18n.translate('xpack.lens.gauge.metricLabel', {
            defaultMessage: 'Metric',
          }),
          paramEditorCustomProps: {
            headingLabel: i18n.translate('xpack.lens.gauge.headingLabel', {
              defaultMessage: 'Value',
            }),
          },
          isMetricDimension: true,
          accessors: metricAccessor
            ? [
                {
                  columnId: metricAccessor,
                  triggerIconType: 'none',
                },
              ]
            : [],
          filterOperations: isNumericDynamicMetric,
          supportsMoreColumns: !metricAccessor,
          requiredMinDimensionCount: 1,
          dataTestSubj: 'lnsRevealImage_metricDimensionPanel',
          enableDimensionEditor: true,
        },
        {
          supportStaticValue: true,
          enableFormatSelector: false,
          layerId: state.layerId,
          groupId: GROUP_ID.MAX,
          groupLabel: i18n.translate('xpack.lens.gauge.maxValueLabel', {
            defaultMessage: 'Maximum value',
          }),
          paramEditorCustomProps: {
            labels: [
              i18n.translate('xpack.lens.gauge.maxValueLabel', {
                defaultMessage: 'Maximum value',
              }),
            ],
            headingLabel: i18n.translate('xpack.lens.gauge.headingLabel', {
              defaultMessage: 'Value',
            }),
          },
          isMetricDimension: true,
          accessors: state.maxAccessor ? [{ columnId: state.maxAccessor }] : [],
          filterOperations: isNumericMetric,
          supportsMoreColumns: !state.maxAccessor,
          dataTestSubj: 'lnsRevealImage_maxDimensionPanel',
          prioritizedOperation: 'max',
          suggestedValue: () => (state.metricAccessor ? getMaxValue(row, accessors) : undefined),
        },
      ],
    };
  },

  setDimension({ prevState, layerId, columnId, groupId, previousColumn }) {
    const update: Partial<RevealImageVisualizationState> = {};
    if (groupId === GROUP_ID.METRIC) {
      update.metricAccessor = columnId;
    }
    if (groupId === GROUP_ID.MAX) {
      update.maxAccessor = columnId;
    }
    return {
      ...prevState,
      ...update,
    };
  },

  removeDimension({ prevState, layerId, columnId }) {
    const update = { ...prevState };

    if (prevState.metricAccessor === columnId) {
      delete update.metricAccessor;
    }

    if (prevState.maxAccessor === columnId) {
      delete update.maxAccessor;
    }

    return update;
  },

  renderDimensionEditor(domElement, props) {
    render(
      <KibanaThemeProvider theme$={theme.theme$}>
        <I18nProvider>
          <div>RevealImageDimensionEditor</div>
        </I18nProvider>
      </KibanaThemeProvider>,
      domElement
    );
  },

  renderToolbar(domElement, props) {
    render(
      <KibanaThemeProvider theme$={theme.theme$}>
        <I18nProvider>
          <div>RevealImageToolbar</div>
        </I18nProvider>
      </KibanaThemeProvider>,
      domElement
    );
  },

  getSupportedLayers(state, frame) {
    const row = state?.layerId ? frame?.activeData?.[state?.layerId]?.rows?.[0] : undefined;
    const accessors = getAccessorsFromState(state);
    const maxValue = getMaxValue(row, accessors);

    return [
      {
        type: LayerTypes.DATA,
        label: i18n.translate('xpack.lens.gauge.addLayer', {
          defaultMessage: 'Visualization',
        }),
        initialDimensions: state
          ? [
              {
                groupId: 'max',
                columnId: generateId(),
                staticValue: maxValue,
              },
            ]
          : undefined,
      },
    ];
  },

  getLayerType(layerId, state) {
    if (state?.layerId === layerId) {
      return state.layerType;
    }
  },

  toExpression: (state, datasourceLayers, attributes, datasourceExpressionsByLayers = {}) =>
    toExpression(state, datasourceLayers, { ...attributes }, datasourceExpressionsByLayers),

  toPreviewExpression: (state, datasourceLayers, datasourceExpressionsByLayers = {}) =>
    toExpression(state, datasourceLayers, undefined, datasourceExpressionsByLayers),

  getUserMessages(state, { frame }) {
    const { metricAccessor } = state;
    if (!metricAccessor) {
      return [];
    }

    const row = frame.activeData?.[state.layerId]?.rows?.[0];
    if (!row) {
      return [];
    }

    const errors = getErrorMessages(row, state);
    if (errors.length) {
      return errors;
    }

    const metricValue = row[metricAccessor];

    const warnings: UserMessage[] = [];

    return warnings;
  },

  getSuggestionFromConvertToLensContext({ suggestions, context }) {
    const allSuggestions = suggestions as Array<
      Suggestion<RevealImageVisualizationState, FormBasedPersistedState>
    >;
    const suggestion: Suggestion<RevealImageVisualizationState, FormBasedPersistedState> = {
      ...allSuggestions[0],
      datasourceState: {
        ...allSuggestions[0].datasourceState,
        layers: allSuggestions.reduce(
          (acc, s) => ({
            ...acc,
            ...s.datasourceState?.layers,
          }),
          {}
        ),
      },
      visualizationState: {
        ...allSuggestions[0].visualizationState,
        ...(context.configuration as RevealImageVisualizationState),
      },
    };
    return suggestion;
  },

  getVisualizationInfo(state, frame) {
    const { accessors } = getConfigurationAccessorsAndPalette(state);
    const dimensions = [];
    if (accessors?.metric) {
      dimensions.push({
        id: accessors.metric,
        name: i18n.translate('xpack.lens.gauge.metricLabel', {
          defaultMessage: 'Metric',
        }),
        dimensionType: 'metric',
      });
    }

    if (accessors?.max) {
      dimensions.push({
        id: accessors.max,
        name: i18n.translate('xpack.lens.gauge.maxValueLabel', {
          defaultMessage: 'Maximum value',
        }),
        dimensionType: 'max',
      });
    }
    return {
      layers: [
        {
          layerId: state.layerId,
          layerType: state.layerType,
          chartType: revealImageId,
          ...this.getDescription(state),
          dimensions,
        },
      ],
    };
  },
});

function getConfigurationAccessorsAndPalette(
  state: RevealImageVisualizationState,
  activeData?: FramePublicAPI['activeData']
) {
  const { metricAccessor } = state ?? {};

  const accessors = getAccessorsFromState(state);

  return { metricAccessor, accessors };
}
