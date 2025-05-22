#    File:         mycode.py                                                    ⣿⣿⣿⣿⣿⣿⣿⣿⣘⠿⠿⠿⢆⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡸⣿⣿⣿⣿⣿⡇⣿⣿⣿⣿⣿⣿    #
#                                                                               ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣮⣭⣭⣴⣿⣿⣿⣿⣿⣿    #
#    Project:      mycode                                                       ⣿⣿⣿⣿⠿⠿⠿⠿⠿⠏⠻⡿⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⠿⠟⠹⠿⠿⠿⠿⠿⣿⣿⣿⣿⣿    #
#    Github:       marsdevx                                                     ⣿⣿⣿⣇⠀⢀⣀⣀⢀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⣿⠅⢀⠀⠀⠀⠀⠀⠀⢀⣀⣀⠀⠈⣿⣿⣿⣿    #
#                                                                               ⣿⣿⣿⣿⣷⡘⣿⣿⡇⢀⣤⣤⣤⣀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⣀⣀⣐⡀⡀⣿⣿⣿⡏⣼⣿⣿⣿    #
#    Created:      15:51   21/05/2025                                           ⣿⣿⣿⣿⣿⣿⣾⣿⣻⣝⣛⣛⣛⣫⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣛⠿⠿⠿⢟⣴⢿⣿⣴⣿⣿⣿⣿⣿    #
#    Updated:      19:07   21/05/2025                                           ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿    #
#                                                                               ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿    #
#    Path:         ./mycode.py                                                  ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿    #
#                                                                               ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡛⠿⠟⣋⣍⣛⣋⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿    #

import os
import json
import parse
import argparse
import subprocess
import create_proj as cp

github_path = os.path.expanduser("~/.config/mycode/config.json")

def check_json():
  if not os.path.exists(github_path):
    data = {
      "github": {
        "username": "",
        "token": ""
      }
    }

    with open(github_path, "w") as f:
      json.dump(data, f, indent=2)

def create(project_name, target_dir):
  target_dir = os.path.expanduser(target_dir)
  if not os.path.isdir(target_dir):
      print(f"Target directory does not exist: {target_dir}")
      return
  
  with open(github_path) as f:
    config_file = json.load(f)
  username = config_file["github"].get("username", "").strip()
  token = config_file["github"].get("token", "").strip()

  if not username.strip() or not token.strip():
    username = input("Enter your GitHub username: ")
    token = input("Enter your GitHub token: ")

    config_file["github"]["username"] = username
    config_file["github"]["token"] = token

    with open(github_path, "w") as f:
      json.dump(config_file, f, indent=2)

  cp.create_project(project_name, target_dir, username, token)

def open_project(project_name, not_close):
  all_projects = parse.collect_projects(parse.config["projects_dir"], parse.config["specific_projects"], parse.config["remove_rules"])
  if project_name in all_projects:
    project_path = all_projects[project_name]
    print(f"Opening project '{project_name}'...")
    subprocess.run(["code", project_path])
    if not not_close:
      print("Closing terminal...")
      script = '''
      tell application "iTerm2"
          tell the current window
              close
          end tell
      end tell
      '''
      subprocess.run(["osascript", "-e", script])
  else:
    print(f"Project '{project_name}' not found.")

desc = ("✨ Manage and organize your projects with **mycode** ✨\n\n"
"📂 Requires a configuration file located at: `~/.config/mycode/mycoderc`\n\n"
"💾 Configuration File Rules:\n"
"  - `--add <path>`: Adds all subfolders in the specified path to global projects.\n"
"  - `--addspecific <path>`: Adds only the specified folder to global projects.\n"
"  - `--remove <path> --from <path>`: Excludes a specific subfolder from a parent path.\n\n"
"🔗 Grouping Projects:\n"
"Groups can be defined using `[group:group_name]` syntax in the configuration file.\n"
"  - Group-specific rules:\n"
"      - `--add <path>`: Adds subfolders to the group only.\n"
"      - `--addspecific <path>`: Adds only the specified folder to the group.\n"
"      - `--remove <path> --from <path>`: Excludes a specific subfolder in the group.\n"
"  - Example:\n"
"      [group:example_group]\n"
"      {\n"
"          --add ~/example/path\n"
"          --addspecific ~/example/specific_project\n"
"          --remove ~/example/path/excluded_folder --from ~/example/path\n"
"      }\n\n"
"🛠 Commands:\n"
"  - `mycode -s`: Show all global projects.\n"
"  - `mycode -s groups`: Show all groups and their projects.\n"
"  - `mycode -s <group_name>`: Show all projects in the specified group.\n"
"  - `mycode <project_name>`: Open the specified project in VS Code.\n"
"  - `mycode <project_name> -n`: Open the project without closing the terminal.\n"
"  - `mycode -c <project_name> <target_dir>`: Create a new project and repository.")

def main():
  check_json()
  prog = argparse.ArgumentParser(prog="mycode", add_help=False)

  prog.add_argument("-s", "--show", nargs="?", const="global", help="Show the data list")
  prog.add_argument("-c", "--create", nargs=2, metavar=("project_name", "target_dir"), help="Create a new project and repository")
  prog.add_argument("project", nargs="?", help="Name of project to open")
  prog.add_argument("-n", "--not-close", action="store_true", help="Don't close terminal after opening project")
  prog.add_argument("-h", "--help", action="store_true", help=argparse.SUPPRESS)

  args = prog.parse_args()

  if args.create:
    project_name, target_dir = args.create
    create(project_name, target_dir)
    all_projects = parse.collect_projects(parse.config["projects_dir"], parse.config["specific_projects"], parse.config["remove_rules"])
    if project_name in all_projects:
        open_project(project_name, False)
  elif args.show:
    if args.show == "global":
      parse.print_proj()
    elif args.show == "groups":
      parse.print_groups()
    elif args.show in parse.config["groups"]:
      parse.print_group(args.show)
    else:
      print(f"Group '{args.show}' not found.")
  elif args.project:
    open_project(args.project, args.not_close)
  if args.help or (not args.create and not args.show and not args.project):
    print(desc)
    return

if __name__ == "__main__":
  main()