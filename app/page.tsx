"use client";

import { Context, Effect, Layer, ManagedRuntime } from "effect";
import { useEffect } from "react";

let init = false;

interface Config {
  minimumLogLevel: "none" | "trace" | "debug" | "warning";
}

const Config = Context.GenericTag<Config>("Config");

const createEvoluRuntime = (
  config: Config
): ManagedRuntime.ManagedRuntime<Config, never> => {
  const ConfigLive = Layer.succeed(Config, config);
  return ManagedRuntime.make(ConfigLive);
};

export default function Page() {
  useEffect(() => {
    if (init) return;
    init = true;

    const runtime = createEvoluRuntime({ minimumLogLevel: "none" });
    const program = Effect.unit;

    let count = 0;

    const times: number[] = [];
    const measureRun = () => {
      // Hitting JIT makes a huge difference.
      // runtime.runFork(program);

      // +- few millis, tested on M1
      const s = performance.now();

      // 0.27 vs 0.05
      // runtime.runFork(program);
      // 0.29 vs 0.05
      // runtime.runCallback(program);
      // 0.34 vs 0.1
      runtime.runPromise(program);
      times.push(performance.now() - s);
    };

    const timer = setInterval(() => {
      if (++count > 100) {
        clearInterval(timer);
        const total = times.reduce((prev, cur) => prev + cur);
        console.log(total / times.length);
        return;
      }
      measureRun();
    }, 50);
  }, []);
  return <h1>Hello, Next.js!</h1>;
}
