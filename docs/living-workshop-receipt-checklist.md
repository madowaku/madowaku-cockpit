# Review a workshop receipt

- Confirm the receipt names the expected Living Workshop run and task identifier so you can match it to the work you requested.
- Check how files were applied: verify the changed paths and method, then compare the resulting changes with the intended task scope before accepting them.
- Review the linked GitHub pull request or commit, including its head revision and available review and CI results; make sure the evidence refers to this receipt’s changes.

## Pass a task and collect a receipt

1. In Logs / Review, open **AI Creole を渡す**, review the generated packet, and copy it.
2. Paste the packet into the intended isolated T3 Code project and send it yourself. For the official CLI on Windows, save the reviewed text as UTF-8 in `handoff.txt`, then run the command below from the registered project. The prompt travels as standard input.

   ```powershell
   Get-Content -LiteralPath .\handoff.txt -Raw -Encoding UTF8 | t3 thread start . - --wait --json
   ```

3. Read the run with `t3 thread show --messages 0 --json <thread-id>` and paste its output into **実行結果を取り込む**. Review the form before saving. Record measured duration, file application, PR and CI evidence separately when known.
4. To move one receipt to another device or browser, use its **コピー** button and paste the JSON into the same import form on the receiving browser. Share it only via a channel you choose. Project backups contain further project data, so use a single receipt for routine transfer. Receipts are scoped to the browser profile and origin (including port), with no automatic sync. A phone cannot open the PC's loopback preview.
