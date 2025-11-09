# Debug
## Debug the NestJS Application

Debugging is a crucial skill for any developer. This guide will walk you through how to debug your NestJS application, including how to pause execution at the very beginning of your application's bootstrap process.

### Running in Debug Mode

The NestJS CLI provides a convenient way to run your application in debug mode. This will start the application with the Node.js inspector agent enabled.

1.  **Start the application in debug mode:**

    Open your terminal and run the following command:

    ```bash
    npm run start:debug
    ```

    This command is a shortcut defined in your `package.json` which typically executes `nest start --debug --watch`. It will start your application, and you'll see output similar to this:

    ```
    Debugger listening on ws://127.0.0.1:9229/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    For help, see: https://nodejs.org/en/docs/inspector
    ```

    This means the Node.js inspector is running and listening on port `9229`.

2.  **Attach a Debugger:**

    You can now attach a debugger to this process. Most modern IDEs have built-in support for this, as do browser developer tools.

    **Using VS Code:**

    If you are using Visual Studio Code, you can create a launch configuration.

    a.  Go to the "Run and Debug" view (Ctrl+Shift+D).
    b.  Click on "create a launch.json file" and select "Node.js".
    c.  VS Code will create a `.vscode/launch.json` file. Add the following configuration to the `configurations` array:

    ```json
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to NestJS",
      "port": 9229,
      "restart": true,
      "protocol": "inspector"
    }
    ```

    d. Now, with your application running via `npm run start:debug`, you can select "Attach to NestJS" from the dropdown in the "Run and Debug" view and press F5 (or the green play button). The debugger will attach to your running NestJS process.

    **Using Chrome Developer Tools:**

    a. Open Chrome and navigate to `chrome://inspect`.
    b. Click on the "Open dedicated DevTools for Node" link.
    c. A new DevTools window will open. Under the "Connection" tab, ensure `localhost:9229` is listed, or add it if it's not.
    d. The `main.js` file of your application should appear as a target. Click on it to start debugging.

### Debugging the Bootstrap Process

Sometimes you need to debug code that runs right at startup, like in your `src/main.ts` file. The standard debug command might not give you enough time to attach the debugger before that code executes.

To solve this, you need to tell Node.js to break (pause) on the first line of code and wait for a debugger to attach. This is done with the `--inspect-brk` flag.

While `nest start` does not have a direct flag for `--inspect-brk`, you can achieve this by modifying your `package.json` scripts.

1.  **Modify `package.json`:**

    Open your `package.json` and add a new script, for example `debug:break`:

    ```json
    "scripts": {
      // ... other scripts
      "start:debug": "nest start --debug --watch",
      "debug:break": "node --inspect-brk -r ts-node/register src/main.ts",
      // ... other scripts
    },
    ```
    *Note: This approach bypasses the NestJS CLI's build process and uses `ts-node` to execute your TypeScript code directly. Make sure you have `ts-node` installed (`npm install -D ts-node`).*

    Currently the app uses the same idea but slightly different approach:
    ```json
    "debug:break": "nodemon --config nodemon-debug.json",
    ```
    where nodemon-debug.json define inspect-brk option, making it clean

2.  **Run the new script:**

    ```bash
    npm run debug:break
    ```

    Your application will start but will immediately pause before executing any of your code, waiting for a debugger to connect.

3.  **Attach your debugger** as described in the previous section (using VS Code or Chrome DevTools). Once attached, you can set breakpoints in `src/main.ts` or any other file, and then resume execution in your debugger to step through the code.

This method gives you full control to debug the entire lifecycle of your application, from the very first line.
