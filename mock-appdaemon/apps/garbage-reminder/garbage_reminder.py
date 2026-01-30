"""Garbage Reminder AppDaemon App

Sends reminders about garbage collection days.
"""

import appdaemon.plugins.hass.hassapi as hass
from datetime import datetime, timedelta


class GarbageReminder(hass.Hass):
    """Garbage collection reminder."""

    def initialize(self):
        """Initialize the app."""
        self.notify_service = self.args["notify_service"]
        self.reminder_time = self.args.get("reminder_time", "19:00:00")
        self.days_before = self.args.get("days_before", 1)

        # Schedule daily check
        self.run_daily(self.check_garbage_day, self.reminder_time)

        self.log("Garbage Reminder initialized")

    def check_garbage_day(self, kwargs):
        """Check if tomorrow is a garbage day and send reminder."""
        tomorrow = datetime.now() + timedelta(days=self.days_before)
        
        # Example: garbage on Tuesdays and Fridays
        if tomorrow.weekday() in [1, 4]:  # Tuesday=1, Friday=4
            self.send_reminder(tomorrow)

    def send_reminder(self, collection_date):
        """Send garbage reminder notification."""
        day_name = collection_date.strftime("%A")
        service_domain, service_name = self.notify_service.split(".", 1)
        
        self.call_service(
            f"{service_domain}/{service_name}",
            message=f"🗑️ Reminder: Garbage collection is tomorrow ({day_name})!",
            title="Garbage Reminder",
        )
        self.log(f"Sent garbage reminder for {day_name}")
