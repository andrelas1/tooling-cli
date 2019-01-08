import "./index.scss";
import testHmr from "./test-hmr";

declare var module;

if (module.hot) {
  // Need to fix this later and then set hotOnly prop on webpack
  console.log("MODULE IS HOT!!");
  module.hot.accept("./test-hmr.ts", () => {
    testHmr();
    console.log("test TS IS ACCEPTD");
  });
}
