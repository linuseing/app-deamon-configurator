"""Thermostat Control AppDaemon App

Schedules thermostat temperature changes throughout the day.
"""

import appdaemon.plugins.hass.hassapi as hass


class ThermostatScheduler(hass.Hass):
    """Scheduled thermostat control."""

    def initialize(self):
        """Initialize the app."""
        self.climate_entity = self.args["climate_entity"]
        self.morning_temp = self.args.get("morning_temp", 21)
        self.evening_temp = self.args.get("evening_temp", 20)
        self.night_temp = self.args.get("night_temp", 18)

        # Schedule temperature changes
        self.run_daily(self.set_morning_temp, "07:00:00")
        self.run_daily(self.set_evening_temp, "18:00:00")
        self.run_daily(self.set_night_temp, "22:00:00")

        self.log(f"Thermostat Scheduler initialized for {self.climate_entity}")

    def set_morning_temp(self, kwargs):
        """Set morning temperature."""
        self.set_temperature(self.morning_temp)
        self.log(f"Set morning temperature to {self.morning_temp}°C")

    def set_evening_temp(self, kwargs):
        """Set evening temperature."""
        self.set_temperature(self.evening_temp)
        self.log(f"Set evening temperature to {self.evening_temp}°C")

    def set_night_temp(self, kwargs):
        """Set night temperature."""
        self.set_temperature(self.night_temp)
        self.log(f"Set night temperature to {self.night_temp}°C")

    def set_temperature(self, temp):
        """Set the thermostat temperature."""
        self.call_service(
            "climate/set_temperature",
            entity_id=self.climate_entity,
            temperature=temp,
        )
