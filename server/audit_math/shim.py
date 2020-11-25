"""shim.py: Shim code to interface between the calling conventions expected by the current
bravo_sample_sizes() code with the API currently provided by the athena module.

TODO: move minerva_sample_sizes into minerva.py and refactor to use exact vote counts,
like we did with compute_risk.
Then this file can be eliminated.
"""

import logging
import math
from typing import Any
from decimal import Decimal
from athena.audit import Audit  # type: ignore


def make_election(risk_limit, p_w: float, p_r: float) -> Any:
    """
    Transform fractional shares to an athena Election object.

    Inputs:
        risk_limit      - the risk-limit for this audit
        p_w             - the fraction of vote share for the winner
        p_r             - the fraction of vote share for the loser / runner-up
    """

    # calculate the undiluted "two-way" share of votes for the winner
    p_wr = p_w + p_r
    p_w2 = p_w / p_wr

    contest_ballots = 100000
    winner = int(contest_ballots * p_w2)
    loser = contest_ballots - winner

    contest = {
        "contest_ballots": contest_ballots,
        "tally": {"A": winner, "LOSER": loser},
        "num_winners": 1,
        "reported_winners": ["A"],
        "contest_type": "PLURALITY",
    }

    contest_name = "ArloContest"
    election = {
        "name": "ArloElection",
        "total_ballots": contest_ballots,
        "contests": {contest_name: contest},
    }

    audit = Audit("minerva", risk_limit)
    audit.add_election(election)
    audit.load_contest(contest_name)

    return audit


def minerva_sample_sizes(
    alpha: Decimal,
    p_w: Decimal,
    p_r: Decimal,
    sample_w: int,
    sample_r: int,
    p_completion: float,
) -> int:
    """
    Return Minerva round size based on completion probability, assuming the election outcome is correct.
    TODO: refactor to pass in integer vote shares to allow more exact calculations, incorporate or
    track round schedule over time, and handle sampling without replacement.

    Inputs:
        risk_limit      - the risk-limit for this audit
        p_w             - the fraction of vote share for the winner
        p_r             - the fraction of vote share for the loser
        sample_w        - the number of votes for the winner that have already
                          been sampled
        sample_r        - the number of votes for the runner-up that have
                          already been sampled
        p_completion    - the desired chance of completion in one round,
                          if the outcome is correct

    Outputs:
        sample_size     - the expected sample size for the given chance
                          of completion in one round

    >>> minerva_sample_sizes(0.1, 0.6, 0.4, 56, 56, 0.7)
    326

    # FIXME: check this
    >>> minerva_sample_sizes(0.1, 0.6, 0.4, 0, 0, 0.7)
    111
    >>> minerva_sample_sizes(0.1, 0.6, 0.4, 0, 0, 0.9)
    179
    """

    risk_limit = float(alpha)
    p_w = float(p_w)  # type: ignore
    p_r = float(p_r)  # type: ignore

    # calculate the undiluted "two-way" share of votes for the winner
    p_wr = p_w + p_r
    p_w2 = p_w / p_wr

    audit = make_election(risk_limit, p_w, p_r)  # type: ignore

    pstop_goal = [p_completion]

    if sample_w or sample_r:
        round_sizes = [sample_w + sample_r]
        audit.add_round_schedule(round_sizes)
        audit.set_observations(round_sizes[0], round_sizes[0], [sample_w, sample_r])
    else:
        round_sizes = []

    if round_sizes:
        status = audit.status[audit.active_contest]
        below_kmin = status.min_kmins[0] - sample_w
    else:
        below_kmin = 0

    res = audit.find_next_round_size(pstop_goal)
    next_round_size_0 = res["future_round_sizes"][0]

    next_round_size = next_round_size_0 + 2 * below_kmin

    size_adj = math.ceil(next_round_size / p_wr)

    logging.info(
        f"shim sample sizes: margin {(p_w2 - 0.5) * 2} (pw {p_w} pr {p_r}) (sw {sample_w} sr {sample_r}) pstop {p_completion} below_kmin {below_kmin} raw {next_round_size} scaled {size_adj}"  # type: ignore
    )

    return size_adj
