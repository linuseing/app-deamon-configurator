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
    // Get the ingress path from the header (Nginx passes this through)
    const ingressPath = request.headers.get("x-ingress-path") || "";
    
    // Clean up basename
    let basename = ingressPath;
    if (basename && basename !== "/" && basename.endsWith("/")) {
        basename = basename.slice(0, -1);
    }
    
    // Debug logging
    console.log(`[entry.server] URL: ${request.url}, X-Ingress-Path: "${ingressPath}", basename: "${basename}"`);

    return new Promise((resolve, reject) => {
        let shellRendered = false;
        const { pipe, abort } = renderToPipeableStream(
            <ServerRouter
                context={routerContext}
                url={request.url}
                basename={basename || undefined}
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
