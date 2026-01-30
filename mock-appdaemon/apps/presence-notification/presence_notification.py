"""Presence Notification AppDaemon App

Sends notifications when a person arrives or leaves home.
"""

import appdaemon.plugins.hass.hassapi as hass


class PresenceNotification(hass.Hass):
    """Presence-based notification sender."""

    def initialize(self):
        """Initialize the app."""
        self.person_entity = self.args["person_entity"]
        self.notify_service = self.args["notify_service"]
        self.arrival_message = self.args.get("arrival_message", "Welcome home!")
        self.departure_message = self.args.get("departure_message", "Goodbye!")

        # Listen for state changes on the person entity
        self.listen_state(self.presence_changed, self.person_entity)

        self.log(f"Presence Notification initialized for {self.person_entity}")

    def presence_changed(self, entity, attribute, old, new, kwargs):
        """Handle presence change event."""
        if old == new:
            return

        if new == "home" and old != "home":
            self.send_notification(self.arrival_message)
            self.log(f"{self.person_entity} arrived home")
        elif old == "home" and new != "home":
            self.send_notification(self.departure_message)
            self.log(f"{self.person_entity} left home")

    def send_notification(self, message):
        """Send a notification."""
        service_domain, service_name = self.notify_service.split(".", 1)
        self.call_service(
            f"{service_domain}/{service_name}",
            message=message,
        )
