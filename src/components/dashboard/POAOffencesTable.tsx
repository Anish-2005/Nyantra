import React from "react";

export const POA_OFFENCES = {
  "1. Offences leading to Death / Murder": {
    "Murder of SC/ST person": 825000,
    "Death due to injury inflicted during atrocity": 825000,
    "Death after rape / gang rape": 825000
  },
  "2. Rape and Sexual Offences": {
    "Rape": 500000,
    "Gang rape": 825000,
    "Attempt to rape": 100000,
    "Parading naked / semi-naked": 200000,
    "Sexual harassment / use of criminal force": 100000
  },
  "3. Grievous Hurt / Injury": {
    "Grievous hurt": 125000,
    "Permanent disability": 500000,
    "Partial disability": 250000,
    "Acid attack – deformity / disability": 825000,
    "Acid attack – injury without deformity": 500000
  },
  "4. Offences Against Women & Dignity": {
    "Outraging modesty of SC/ST woman": 100000,
    "Sexual exploitation / trafficking": 200000,
    "Forced to work naked / semi-naked": 200000
  },
  "5. Property Damage / Arson": {
    "Burning of house / arson": "225000-425000",
    "Destruction of household / property": "100000-200000",
    "Destruction of crops": 100000,
    "Destruction of cattle / livestock": 60000
  },
  "6. Land & Economic Offences": {
    "Wrongful dispossession from land": 200000,
    "Destruction of standing crops": 100000,
    "Economic boycott": 100000,
    "Social boycott": 100000,
    "Bonded labour / forced labour": 100000
  },
  "7. Caste Atrocity / Humiliation Offences": {
    "Intentional insult, intimidation, caste abuse": 100000,
    "Preventing entry into public place": 100000,
    "Preventing access to public well/tank/roads": 100000,
    "Compelling to eat inedible / obnoxious substances": 100000
  },
  "8. Kidnapping / Abduction": {
    "Kidnapping SC/ST person": "100000-200000",
    "Abduction with intent to outrage modesty": 200000
  },
  "9. Mental Torture / Harassment": {
    "Harassing, humiliating, intimidating": 100000,
    "Public humiliation": "100000-200000"
  },
  "10. Other Serious Offences": {
    "Preventing from voting": 100000,
    "Poll violence against SC/ST": 200000,
    "False, malicious, vexatious legal cases": 100000
  }
};

const POAOffencesTable: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border theme-border-glass text-sm">
        <thead>
          <tr className="theme-bg-glass">
            <th className="p-2 border theme-border-glass text-left">Category</th>
            <th className="p-2 border theme-border-glass text-left">Offence</th>
            <th className="p-2 border theme-border-glass text-left">Compensation (₹)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(POA_OFFENCES).map(([category, offences]) =>
            Object.entries(offences as Record<string, string | number>).map(
              ([offence, amount], idx) => (
                <tr key={category + offence}>
                  {idx === 0 && (
                    <td
                      className="p-2 border theme-border-glass font-semibold align-top"
                      rowSpan={Object.keys(offences).length}
                    >
                      {category}
                    </td>
                  )}
                  <td className="p-2 border theme-border-glass">{offence}</td>
                  <td className="p-2 border theme-border-glass">
                    {typeof amount === "number"
                      ? amount.toLocaleString("en-IN")
                      : amount}
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default POAOffencesTable;
