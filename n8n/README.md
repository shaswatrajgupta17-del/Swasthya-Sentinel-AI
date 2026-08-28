# Phase 7 n8n notification flow

`high-risk-alert-poll.json` is an inactive n8n export for the single Phase 7 alert path.

## Flow

1. Schedule Trigger polls every five minutes.
2. HTTP Request calls `GET http://host.docker.internal:8000/alerts?status=open`.
3. Code keeps High alerts with `score_0_100 >= 70` and formats a geographic notification from the API's top factors.
4. HTTP Request posts the notification JSON to `SENTINEL_NOTIFICATION_WEBHOOK_URL`.

The notification URL is read only from the n8n process environment. Set `SENTINEL_NOTIFICATION_WEBHOOK_URL` to a local request catcher or demo webhook before activating the workflow. An empty value is intentionally not supplied, so importing the workflow cannot send to an unknown endpoint accidentally. No credentials are included.

The API payload contains synthetic aggregate data only: location, score, cluster, model version, and factor notes. It contains no patient identifiers and states `not_a_diagnosis: true`.

## Demo check

From the project root, seed and score the demo database, start FastAPI, import the workflow, and configure a receiver. The planted Rampur, Lakshmipur, and Devgaon rows are High and appear in the notification log. The same alerts remain available at `/alerts` if n8n is stopped.
