# ICP engine

Score is 0–100. All match decisions use the current ICP text criteria. Blank ICP criteria score zero and do not penalize an account. A user can change weights in `config/icp-scoring.json` for the service version.

| Criterion | Points | Evidence needed |
|---|---:|---|
| Industry | 15 | Company site or credible directory |
| Geography | 10 | Company/contact page |
| Employee size | 10 | Credible company profile or report |
| Business model | 10 | Product, trade or company page |
| Operational complexity | 15 | Warehouses, channels, imports, manufacturing, locations |
| Pain signal | 15 | Concrete, public operational or technology signal |
| ERP / technology fit | 10 | Tech, job, case study or product signal |
| Expansion / trigger | 10 | Dated public event or announcement |
| Evidence quality | 5 | 1 sourced fact=40% of criterion; 2=80%; 3 with a high-confidence fact=100% |

65+ is qualified; 40–64 is review; below 40 is not a fit for now. A score is a prioritization decision—not proof of need, budget, or authority.
