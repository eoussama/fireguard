import dx from "@eoussama/dx";



export default dx({ svelte: true }).append({
  files: ["**/*.svelte"],
  rules: {
    "import/newline-after-import": "off",
  },
});
