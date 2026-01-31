import { PassThrough } from "node:stream";
import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { renderToPipeableStream } from "react-dom/server";

export const streamTimeout = 5000;

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext,
    loadContext: AppLoadContext
) {
    // In SPA mode, we still render the shell but let the client handle routing
    // The client will detect the basename from window.location
    
    return new Promise((resolve, reject) => {
        let shellRendered = false;
        const { pipe, abort } = renderToPipeableStream(
            <ServerRouter
                context={routerContext}
                url={request.url}
            />,
            {
                onShellReady() {
                    shellRendered = true;
                    const body = new PassThrough();
                    const stream = createReadableStreamFromReadable(body);

                    responseHeaders.set("Content-Type", "text/html");

                    resolve(
                        new Response(stream, {
                            headers: responseHeaders,
                            status: responseStatusCode,
                        })
                    );

                    pipe(body);
                },
                onShellError(error: unknown) {
                    reject(error);
                },
                onError(error: unknown) {
                    responseStatusCode = 500;
                    if (shellRendered) {
                        console.error(error);
                    }
                },
            }
        );

        setTimeout(abort, streamTimeout + 1000);
    });
}
