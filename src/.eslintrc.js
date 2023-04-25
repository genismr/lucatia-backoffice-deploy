"use strict";

const fs = require("fs");
const path = require("path");

const restrictedPaths = [
  { name: "react-bootstrap" },
  { name: "@material-ui/core" }
].map(pkg =>
  fs
    .readdirSync(path.dirname(require.resolve(`${pkg.name}/package.json`)))
    .map(component => ({
      name: `${pkg.name}/${component}`,
      message: `This loads CommonJS version of the package. To fix replace with: import { ${component} } from "${pkg.name}";`
    }))
);

module.exports = {
  extends: "eslint-config-react-app",
  rules: {
    "jsx-a11y/anchor-is-valid": "warn",
    "no-restricted-imports": ["error", { paths: [].concat(...restrictedPaths) }],
    "no-unused-vars": ["warn"],
		"no-multiple-empty-lines": ["error", {"max": 2}],
		"no-trailing-spaces": ["error"],
		"object-curly-spacing": ["warn", "always"],
		"arrow-spacing": ["warn", {"before": true, "after": true}],
		"keyword-spacing": ["warn", {"before": true, "after": true}],
		"curly": [2, "multi"],
		"nonblock-statement-body-position": ["warn", "below"],
		"indent": ["error", "tab"],
		"linebreak-style": ["error", "unix"],
		"quotes": ["error", "single"],
		"semi": ["error", "never"]
  }
};
