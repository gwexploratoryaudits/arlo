# API Documentation

- `POST /election/new`

```jsonc
{
  "electionId": "03649ac0-b623-11e9-83e1-bf0244df89af"
}
```

- `GET /election/{electionId}/audit/status` -- get the whole data structure for the whole audit

`sampleSizeOptions` may be null, in which case this is an indication
that the server is still computing these values and the client should
poll until those values are filled.

```jsonc
{
  "name": "Primary 2019",
  "riskLimit": 10,
  "randomSeed": "sdfkjsdflskjfd",

  "contests": [
    {
      "id": "contest-1",
      "name": "Contest 1",

      "choices": [
        {
          "id": "candidate-1",
          "name": "Candidate 1",
          "numVotes": 42
        }
      ],

      "totalBallotsCast": 4200
    }
  ],

  "jurisdictions": [
    {
      "id": "adams-county",
      "name": "Adams County",
      "contests": ["contest-1"],
      "auditBoards": [
        {
          "id": "63ce500e-acf0-11e9-b49e-bfb880180fb4",
          "name": "Audit Board #1",
          "members": []
        },
        {
          "id": "7134a64e-acf0-11e9-bb0c-57b152ee1513",
          "name": "Audit Board #2",
          "members": []
        }
      ],
      "ballotManifest": {
        "file": {
          "name": "Adams_County_Manifest.csv",
          "uploadedAt": "2019-06-17 11:45:00"
        },
        "processing": {
          "status": "PROCESSED",
          "startedAt": "2019-06-17 11:45:00",
          "completedAt": "2019-06-17 11:45:03",
          "error": null
        },
        "numBallots": 123456,
        "numBatches": 560,
        // Deprecated fields.
        "filename": "Adams_County_Manifest.csv",
        "uploadedAt": "2019-06-17 11:45:00"
      }
    }
  ],

  "rounds": [
    {
      "startedAt": "2019-06-17 11:45:00",
      "endedAt": "2019-06-17 11:55:00",
      "contests": [
        {
          "id": "contest-1",
          "endMeasurements": {
            "pvalue": 0.085,
            "isComplete": false
          },
          "results": {
            "candidate-1": 55,
            "candidate-2": 35
          },

          "sampleSizeOptions": [
            { "prob": 0.5, "size": 143 },
            { "type": "ASN", "prob": 0.6, "size": 157 }
          ],

          "sampleSize": 152
        }
      ],
      "jurisdictions": {
        "adams-county": {
          "numBallots": 15
        }
      }
    },

    {
      "startedAt": "2019-06-17 11:56:00",
      // no endedAt
      "contests": [
        {
          "id": "contest-1"

          // no results yet

          // no sample size options yet, they're being computed
        }
      ],
      "jurisdictions": {
        "adams-county": {
          "numBallots": 15
        }
      }
    }
  ]
}
```

- `POST /election/{electionId}/audit/basic` -- the overall audit configuration

```jsonc
{
  "name": "Primary 2019",
  "riskLimit": 10,
  "randomSeed": "sdfkjsdflskjfd",

  "contests": [
    {
      "id": "contest-1",
      "name": "Contest 1",

      "choices": [
        {
          "id": "candidate-1",
          "name": "Candidate 1",
          "numVotes": 42
        }
      ],

      "totalBallotsCast": 4200
    }
  ]
}
```

- `POST /election/{electionId}/audit/jurisdictions` -- the jurisdictions that are going to be auditing

```jsonc
{
  "jurisdictions": [
    {
      "id": "adams-county",
      "name": "Adams County",
      "contests": ["contest-1"],
      "auditBoards": [
        {
          "id": "63ce500e-acf0-11e9-b49e-bfb880180fb4",
          "name": "Audit Board #1",
          "members": []
        },
        {
          "id": "7134a64e-acf0-11e9-bb0c-57b152ee1513",
          "name": "Audit Board #2",
          "members": []
        }
      ]
    }
  ]
}
```

- `POST /election/{electionId}/audit/sample-size` -- the selected sample size from the given sampleSizeOptions

```jsonc
{
  "size": 578
}
```

- `PUT /election/{electionId}/jurisdiction/<jurisdiction_id>/manifest` -- the ballot manifest

straight file upload `multipart/form-data`

- `DELETE /election/{electionId}/jurisdiction/<jurisdiction_id>/manifest` -- delete the ballot manifest

- `POST /election/{electionId}/jurisdiction/<jurisdiction_id>/<round_num>/results` -- the results for one round

```jsonc
{
  "contests": [
    {
      "id": "contest-1",
      "results": {
        "candidate-1": 55,
        "candidate-2": 35
      }
    }
  ]
}
```

- `GET /election/{electionId}/jurisdiction/<jurisdiction_id>/<round_num>/retrieval-list` -- retrieval list as an attachment

- `GET /election/{electionId}/audit/report` -- the audit report

- `POST /election/{electionId}/audit/reset` -- reset the whole thing (we may deprecate this one in the future to prevent erroneous deletions, since you can just create a new audit)
