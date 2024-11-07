export function validateAllowedProperties<T extends object, U extends object>(
  input: T,
  allowedData: U,
  excludeKeys: string[] = [],
) {
  for (const key in input) {
    if (
      !Object.prototype.hasOwnProperty.call(allowedData, key) &&
      !excludeKeys.includes(key)
    ) {
      const allowedKeys = Object.keys(allowedData).map((key) => `'${key}'`);
      const formatter = new Intl.ListFormat("en", {
        style: "long",
        type: "conjunction",
      });
      const formattedKeys = formatter.format(allowedKeys);

      throw new Error(
        `Property '${key}' cannot be modified. Only ${formattedKeys} can be updated.`,
      );
    }
  }
}
