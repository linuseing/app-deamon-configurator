"""Motion Light AppDaemon App

Turns on a light when motion is detected and turns it off after a delay.
"""

import appdaemon.plugins.hass.hassapi as hass


class MotionLight(hass.Hass):
    """Motion-activated light control."""

    def initialize(self):
        """Initialize the app."""
        self.motion_sensor = self.args["motion_sensor"]
        self.target_light = self.args["target_light"]
        self.delay = self.args.get("delay", 120)
        self.brightness = self.args.get("brightness", 100)
        self.only_after_sunset = self.args.get("only_after_sunset", False)

        self.timer_handle = None

        # Listen for motion
        self.listen_state(self.motion_detected, self.motion_sensor, new="on")
        self.listen_state(self.motion_cleared, self.motion_sensor, new="off")

        self.log(f"Motion Light initialized for {self.target_light}")

    def motion_detected(self, entity, attribute, old, new, kwargs):
        """Handle motion detected event."""
        if self.only_after_sunset and self.sun_up():
            self.log("Motion detected but sun is up, ignoring")
            return

        # Cancel any pending off timer
        if self.timer_handle:
            self.cancel_timer(self.timer_handle)
            self.timer_handle = None

        # Turn on the light
        self.turn_on(self.target_light, brightness_pct=self.brightness)
        self.log(f"Motion detected, turned on {self.target_light}")

    def motion_cleared(self, entity, attribute, old, new, kwargs):
        """Handle motion cleared event."""
        # Start the off timer
        self.timer_handle = self.run_in(self.turn_off_light, self.delay)
        self.log(f"Motion cleared, will turn off in {self.delay}s")

    def turn_off_light(self, kwargs):
        """Turn off the light after delay."""
        self.turn_off(self.target_light)
        self.log(f"Turned off {self.target_light}")
        self.timer_handle = None
