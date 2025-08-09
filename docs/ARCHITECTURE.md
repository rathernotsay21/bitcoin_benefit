# Architecture

This document provides an overview of the architecture of the Bitcoin Benefit project.

## Type Strategy

This project employs a robust type strategy centered around the use of [Zod](https://zod.dev/) for runtime data validation. This approach ensures that all data entering the system is valid and conforms to the expected shape, which helps to prevent a wide range of bugs and security vulnerabilities.

### Zod Schemas

Zod schemas are defined in `src/lib/on-chain/validation.ts`. These schemas are used to validate data from forms and other external sources.

For example, the `trackerFormSchema` is used to validate the data submitted from the on-chain vesting tracker form:

```typescript
export const trackerFormSchema = z.object({
  address: bitcoinAddressSchema,
  vestingStartDate: z.string()
    .min(1, 'Vesting start date is required')
    .refine(date => !isNaN(Date.parse(date)), 'Invalid date format')
    .refine(validateNotFutureDate, 'Start date cannot be in the future'),
  annualGrantBtc: z.number({
    required_error: 'Annual grant amount is required',
    invalid_type_error: 'Annual grant must be a number'
  })
    .positive('Annual grant must be positive')
    .refine(validateGrantAmount, 'Annual grant must be between 1 satoshi and 21 BTC'),
  totalGrants: z.number({
    required_error: 'Total grants is required',
    invalid_type_error: 'Total grants must be a number'
  })
    .int('Total grants must be a whole number')
    .positive('Total grants must be positive')
    .refine(validateTotalGrants, 'Total grants must be between 1 and 20')
});
```

### Benefits of Using Zod

*   **Runtime Safety:** Zod provides runtime validation, which means that it can catch errors that TypeScript's static type checking cannot.
*   **Clear Error Messages:** Zod provides detailed error messages that make it easy to debug validation issues.
*   **Type Inference:** Zod schemas can be used to infer TypeScript types, which helps to keep the code DRY and reduces the amount of boilerplate code that needs to be written.

## Compliance Considerations

This project is intended for informational purposes only and does not constitute financial, legal, or tax advice. The tax treatment of cryptocurrency is complex and varies by jurisdiction. Users should consult with a qualified professional before making any financial decisions.

### Future Improvements

*   **FIFO/LIFO Cost Basis Accounting:** The current implementation only supports high, low, and average cost basis methods. For tax purposes, First-In, First-Out (FIFO) and Last-In, First-Out (LIFO) are common methods. While more complex to implement, adding support for these methods would significantly enhance the utility of the tool for tax planning.
*   **Jurisdiction-Specific Tax Rules:** For a more advanced implementation, consider adding support for jurisdiction-specific tax rules.
*   **GAAP/IFRS-Compliant Reporting:** For enterprise customers, consider adding a separate module for GAAP/IFRS-compliant financial reporting.
