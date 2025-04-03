# Step 1: Create a new orphan branch (detached from history)
# git checkout --orphan new-branch
#
# # Step 2: Add all files
# git add .
#
# # Step 3: Make a new initial commit
# git commit -m "Initial commit after history removal"
#
# # Step 4: Delete the old branch
# git branch -D main  # Replace 'main' with your actual branch name
#
# # Step 5: Rename new branch to main (or your desired branch)
# git branch -m main
#
# # Step 6: Force push the new branch to remote
# git push -f origin main
#
