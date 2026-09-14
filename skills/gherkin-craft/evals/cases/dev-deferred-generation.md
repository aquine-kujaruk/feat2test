# Prior context

Earlier context: Verification will exercise programmed configuration validation.
The team deliberately has not selected a test language, framework, runner, or
the number, names, or organization of generated test and support files. Those
choices may change later without changing the behavior to verify.

# Request

Use gherkin-craft to write native .feature specifications in output/. Leave
indispensable unresolved decisions visible. Do not implement a loader or tests.

# Source material

Constructed configuration rule. A service configuration has a required endpoint
name and a timeout in seconds. Validation accepts an endpoint name containing at
least one letter and a timeout from 1 through 30 seconds inclusive. It rejects a
missing endpoint name, a name containing no letter, and a timeout outside that
range, identifying the violated requirement. Validation does not connect to the
endpoint or change the configuration.
