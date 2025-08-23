# Claude Code Hooks and Output Styles Guide

This guide provides a step-by-step plan for installing and configuring Claude Code hooks and setting up output styles for your project.

## Part 1: Installing and Configuring Claude Code Hooks

This section will guide you through the process of setting up Claude Code hooks.

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Astral UV**: A fast Python package installer and resolver. You can find installation instructions on the official Astral UV website.
*   **Claude Code**: The command-line interface for Claude AI.

### Step 1: Create the Hooks Directory

1.  Create a `.claude/hooks` directory in the root of your project. This directory will contain the Python scripts for your hooks.

    ```bash
    mkdir -p .claude/hooks
    ```

### Step 2: Create Hook Scripts

1.  Inside the `.claude/hooks` directory, create Python scripts for the hooks you want to use. For example, you can create a `user_prompt_submit.py` script.

    ```python
    # .claude/hooks/user_prompt_submit.py
    # This is a simple example of a hook script.
    import sys
    import json

    if __name__ == "__main__":
        # Your hook logic here
        print("UserPromptSubmit hook executed successfully.")
        sys.exit(0)
    ```

### Step 3: Configure Hooks in `settings.json`

1.  Create or open the `.claude/settings.json` file in your project's root directory.

2.  Configure the hooks by adding entries for each hook type. The following example shows how to configure a `UserPromptSubmit` hook:

    ```json
    {
      "UserPromptSubmit": [
        {
          "hooks": [
            {
              "type": "command",
              "command": "uv run .claude/hooks/user_prompt_submit.py --log-only"
            }
          ]
        }
      ]
    }
    ```

3.  You can add different options to the command, such as:
    *   `--validate`: To enable security validation.
    *   `--context`: To add project context to prompts.

### Step 4: Hook Flow Control

You can control the execution flow of your hooks using exit codes:

*   **Exit Code 0**: Indicates success.
*   **Exit Code 2**: Represents a blocking error. This will prevent the prompt from being sent to Claude or a tool from executing.
*   **Other Non-zero Exit Codes**: Indicate a non-blocking error, which will be displayed to the user without stopping the execution.

Hooks can also return structured JSON for more granular control, such as approving or blocking a tool's execution with a specific reason.

## Part 2: Setting Up Output Styles

This section explains how to configure different output styles, such as the status line.

### Step 1: Create a Directory for Styles

1.  Create a directory for your style scripts, for example, `.claude/status_lines`.

    ```bash
    mkdir -p .claude/status_lines
    ```

### Step 2: Create a Style Script

1.  Create a Python script for your custom style. For example, you can create a `status_line_v3.py` script in the `.claude/status_lines` directory.

    ```python
    # .claude/status_lines/status_line_v3.py
    # Example of a custom status line script
    if __name__ == "__main__":
        print("My Custom Status Line")
    ```

### Step 3: Configure the Style in `settings.json`

1.  Open the `.claude/settings.json` file.

2.  Add a configuration for the style. The following example shows how to set a custom status line:

    ```json
    {
      "StatusLine": {
        "command": "uv run .claude/status_lines/status_line_v3.py"
      }
    }
    ```

By following this guide, you can effectively install and configure Claude Code hooks and customize output styles to better suit your project's needs.
