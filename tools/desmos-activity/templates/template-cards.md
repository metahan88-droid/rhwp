# Template Cards

## cover_fact_card

Use for the first screen. Show the real situation, one visual, and the numbers students must interpret.

## notice_predict

Use before computation. Collect a prediction and a reason. Do not grade this screen.

## numeric_check

Use for a single numerical answer. Put correctness on the Math Input. Use a feedback Note for student-facing messages.

## unit_rate_model

Use for proportional reasoning. Define the known quantities once, pass them to a graph, and ask students to compute the target value.

## randomized_practice

Use for repeated practice. Connect an Action Button's `pressCount` to `randomGenerator(seed)` so students can request a new problem.

## graph_match

Use for interpretive feedback. Pass a student value or parsed equation into a graph and let students compare the result visually.

## smooth_slide_graph_check

Use for slope/linear-function activities like a smooth slide. The graph owns the mathematical model and defines `C=1` when the construction is correct. CL sends button time into the graph and reads `graph.number("C")` for dashboard correctness.

## table_check

Use for ratio tables. Freeze table dimensions first, then check specific cells.

## card_sort_check

Use after a card sort answer key is set. Give progress feedback using `totalCorrectCards`.

## reflection

Use for discourse and dashboard review. Avoid automatic correctness unless the prompt has a narrow expected response.
