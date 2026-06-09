const ADDRESS_COMMAND = /^(get\s+my\s+address|get\s+address|my\s+address)$/i;
const BALANCE_COMMAND = /^(check(\s+my)?\s+balance|get(\s+my)?\s+balance)$/i;
const SEND_COMMAND = /^send\s+(\d*\.?\d+)\s+sol\s+to\s+([1-9A-HJ-NP-Za-km-z]{32,44})$/i;

function parseKeyValueFields(message) {
  const fields = {};

  for (const rawLine of message.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || /^create\s+token$/i.test(line)) continue;

    const match = line.match(/^(name|symbol|decimals|supply)\s*:\s*(.+)$/i);
    if (!match) continue;

    const key = match[1].toLowerCase();
    fields[key] = match[2].trim();
  }

  return fields;
}

function parseCreateTokenCommand(message) {
  if (!/^create\s+token\b/i.test(message)) {
    return null;
  }

  const text = message.trim();
  const body = text.replace(/^create\s+token\b/i, "").trim();
  const fields = parseKeyValueFields(text);
  const errors = [];

  let symbol = fields.symbol ?? null;
  let name = fields.name ?? null;
  let decimals = fields.decimals ?? null;
  let supply = fields.supply ?? null;

  if (!symbol && body) {
    const bareSymbolMatch = body.match(/^([A-Za-z0-9]{2,10})\b/);
    if (bareSymbolMatch && !/^(name|symbol|decimals|supply)\b/i.test(body)) {
      symbol = bareSymbolMatch[1];
    }
  }

  const nameMatch = text.match(/name\s+(.+?)(?=\s+(?:symbol|decimals|supply)\b|$)/i);
  if (nameMatch) {
    name = nameMatch[1].trim();
  }

  const symbolMatch = text.match(/symbol\s+([A-Za-z0-9]{2,10})\b/i);
  if (symbolMatch) {
    symbol = symbolMatch[1];
  }

  const decimalsMatch = text.match(/decimals\s+([0-9]+)\b/i);
  if (decimalsMatch) {
    decimals = decimalsMatch[1];
  }

  const supplyMatch = text.match(/supply\s+([0-9]+)\b/i);
  if (supplyMatch) {
    supply = supplyMatch[1];
  }

  if (!symbol) {
    errors.push("Symbol is required.");
  }

  const normalizedSymbol = symbol ? symbol.toUpperCase().trim() : "";
  const normalizedName = name?.trim() || normalizedSymbol;
  const normalizedDecimals = decimals == null || decimals === "" ? 9 : Number(decimals);
  const normalizedSupply = supply == null || supply === "" ? 1000000 : Number(supply);

  if (normalizedName.length === 0) {
    errors.push("Name is required.");
  }
  if (normalizedName.length > 32) {
    errors.push("Name must be 32 characters or fewer.");
  }
  if (normalizedSymbol.length < 2) {
    errors.push("Symbol must be at least 2 characters.");
  }
  if (normalizedSymbol.length > 10) {
    errors.push("Symbol must be 10 characters or fewer.");
  }
  if (!Number.isInteger(normalizedDecimals) || normalizedDecimals < 0 || normalizedDecimals > 9) {
    errors.push("Decimals must be an integer from 0 to 9.");
  }
  if (!Number.isInteger(normalizedSupply) || normalizedSupply <= 0) {
    errors.push("Supply must be a positive integer.");
  }

  if (errors.length > 0) {
    return {
      type: "invalid",
      message: errors.join(" "),
    };
  }

  return {
    type: "create_token",
    name: normalizedName,
    symbol: normalizedSymbol,
    decimals: normalizedDecimals,
    supply: normalizedSupply,
  };
}

export function parseCommand(input) {
  const message = input.trim();

  if (ADDRESS_COMMAND.test(message)) {
    return { type: "get_address" };
  }

  if (BALANCE_COMMAND.test(message)) {
    return { type: "check_balance" };
  }

  const sendMatch = message.match(SEND_COMMAND);
  if (sendMatch) {
    return {
      type: "send_sol",
      amount: Number(sendMatch[1]),
      recipient: sendMatch[2],
    };
  }

  const tokenCommand = parseCreateTokenCommand(message);
  if (tokenCommand) {
    return tokenCommand;
  }

  return { type: "unsupported" };
}
