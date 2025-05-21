#                                                                      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠐⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠑⠀⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀    #
#                                                                      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⢀⠔⠁⠀⠀⠀⢀⠤⠀⠀⠀⠀⠀⠀⠠⢀⠀⠀⠀⠀⡈⠢⡀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀    #
#                                                                      ⠀⠀⠀⠀⠀⠀⠀⢀⠔⠁⠤⠑⡖⠁⠀⠀⠀⠀⠔⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠑⢄⠀⠀⠈⠠⡘⢖⠁⠈⠐⡄⠀⠀⠀⠀⠀⠀⠀⠀    #
#                                                                      ⠀⠀⠀⠀⠀⠀⢠⠂⡐⠀⠀⡊⠀⠀⠀⠀⠀⡡⠒⠀⠀⠀⢀⠆⢣⠀⠀⠀⠀⠀⢄⠡⡀⠀⠀⠈⢌⢆⠂⠄⠈⢢⠀⠀⠀⠀⠀⠀⠀    #
#                                                                      ⠀⠀⠀⠀⠀⠀⠆⠐⠀⠀⡜⢀⠀⠀⠀⠀⡔⠀⠀⠀⠀⡠⠃⠀⠀⠣⡀⠀⠀⠀⠀⠐⢵⡀⠀⠀⠈⡌⡂⠈⠆⠀⢢⠀⠀⠀⠀⠀⠀    #
#                                                                      ⠀⠀⠀⠀⠀⡘⠀⠉⠀⢀⡇⠌⠀⠀⠀⡔⠀⠀⠀⣀⠖⠀⠀⠀⠀⠀⠈⠦⣀⠀⠀⠀⠀⠇⠀⠀⠀⠘⢧⠀⠸⠀⠀⢇⠀⠀⠀⠀⠀    #
#    File:         parse.py                                            ⠀⠀⠀⠀⠀⡁⠀⠀⠀⢸⢢⠁⠀⠀⠐⠀⠀⡠⠚⠀⠉⠂⠀⠀⠀⠀⠀⠘⠀⠸⢅⠀⠀⠸⠀⠀⠀⠀⣿⡀⠀⡇⠀⠈⠄⠀⠀⠀⠀    #
#                                                                      ⢰⠠⣤⠄⠸⠀⠀⠀⣀⡜⡌⠀⠀⠀⢸⠉⣅⣤⣀⣒⠄⠀⠀⠀⠀⠀⠀⠠⢐⣠⣤⣤⣱⠒⡇⠀⠀⠀⢸⡡⠀⠃⠤⠤⢤⡄⠖⢒⠆    #
#    Project:      mycode                                              ⠀⠱⢄⠈⢅⠒⢐⠠⢄⠈⡇⠀⠀⠐⢻⠟⢋⠟⢋⠙⣗⡄⠀⠀⠀⠀⠀⢐⡟⢉⠙⢮⠙⢷⡟⠀⠀⠀⢸⢀⠄⠂⢠⠍⠀⢀⠄⠊⠀    #
#    Github:       marsdevx                                            ⠀⠀⢀⠕⠠⡀⠈⠂⠣⠀⠆⠀⠀⠀⠸⠂⢸⣀⠻⢇⢸⠀⠀⠀⠀⠀⠀⠸⣀⠿⢄⢸⠀⢁⠃⠀⠀⠠⢸⢨⠀⠀⠀⡠⠔⢡⠀⠀⠀    #
#                                                                      ⠀⢀⠌⠀⠀⠑⠠⡀⠀⠂⡆⡆⠀⠀⡀⡆⠈⢫⢀⠸⠊⠀⠀⠀⠀⠀⠀⠀⠫⢄⠨⠊⠀⡘⠀⠀⠀⢰⢸⠈⢀⡠⠐⠁⠀⠈⡆⠀⠀    #
#    Created:      15:57   21/05/2025                                  ⢀⠎⢀⠎⠀⠀⡘⠘⠈⠐⢣⢰⡀⠀⠸⣜⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⢥⠆⠀⡠⢨⠎⠉⢡⠐⠀⠀⠀⠀⢰⠀⠀    #
#    Updated:      19:02   21/05/2025                                  ⡎⠰⢉⠀⠀⠀⣣⠂⠀⠀⠀⠻⠔⠄⡀⢯⡘⠂⠀⠀⠀⠀⠀⠰⣓⡄⠀⠀⠀⠀⠨⡰⢀⡞⠠⠊⠻⠊⠀⠀⠈⠰⠀⠀⠀⠆⢰⠀⠀    #
#                                                                      ⡇⡆⢈⠀⡇⠀⠃⠀⠀⠀⠀⠀⠀⠀⠈⠉⠑⠢⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡠⠘⠁⠀⠀⠀⠀⠀⠀⠀⢰⣸⠀⠀⡘⢀⡌⠀⠀    #
#    Path:         ./parse.py                                          ⠈⠣⠨⡐⠘⠆⡘⢄⡀⠀⠀⠀⠀⠀⢨⠑⡀⠀⠀⢀⣸⢲⡆⠠⠀⠤⢒⣾⣻⣄⠎⡇⢀⠞⠠⠀⠀⠀⠀⠀⢋⠆⢀⠔⠡⠋⠀⠀⠀    #
#                                                                      ⠀⠀⠀⠈⠁⠀⠈⠁⠀⠀⠀⠐⢏⠢⡠⢆⠱⡔⠒⠉⢾⢱⢫⢉⠉⠉⠛⠘⠁⣷⠀⢎⡍⢀⢦⠔⢋⠄⠀⠀⠉⠀⠁⠀⠀⠀⠀⠀⠀    #
#                                                                      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⢄⡊⠢⡀⠙⠂⠐⣄⠀⠋⣾⢨⠿⠿⠀⢀⡠⡸⢞⠀⠈⠀⠚⢁⠄⠋⢤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀    #
#                                                                      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢉⠢⢀⡈⠁⡠⠐⡐⠈⠐⠁⡩⠏⡚⠛⠙⣂⣏⠓⠚⠐⠄⠐⢀⠀⣀⡠⢝⡗⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀    #
#                                                                      ⠀⠀⠀⠀⠀⠀⠀⠀⢠⠖⠋⠮⡥⣴⡀⠀⠐⠁⠀⡠⠃⠀⠀⠀⠀⠊⠀⠀⡁⠢⠀⠀⠁⠀⢀⡺⢩⡞⡂⢄⠓⢄⠀⠀⠀⠀⠀⠀⠀    #
#                                                                      ⠀⠀⠀⠀⠀⠀⠀⠀⡴⠖⡡⡎⣸⠈⡌⠀⠀⡴⢊⠀⠀⠀⠀⠀⠀⠀⢀⠚⠀⠀⠀⠱⢣⠈⢡⠃⡈⡃⡄⠀⠐⠈⢄⠀⠀⠀⠀⠀⠀    #
#                                                                      ⠀⠀⠀⠀⠀⠀⠀⠰⠁⢀⠃⢇⢉⠆⠱⡀⡴⠁⡘⠀⠀⠀⠀⠀⠀⢀⠊⠀⠀⠀⠀⣆⡈⡢⠊⢠⡡⡱⠁⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀    #
#                                                                      ⠀⠀⠀⠀⠀⠀⠀⢰⠀⠈⠀⠈⢦⠉⡢⡈⠑⡺⠃⠀⠀⠀⠀⢀⠔⠁⠀⠀⠀⠀⠀⠈⠣⣅⠔⢔⠔⠁⠀⠀⠀⠀⠜⠀⠀⠀⠀⠀⠀    #

from pathlib import Path
import os

CONFIG_PATH = Path.home() / ".config/mycode/mycoderc"

def parse_config():
  current_group = None
  global_data = {
    "projects_dir": [],
    "specific_projects": {},
    "remove_rules": [],
    "groups": {}
  }

  with CONFIG_PATH.open() as file:
    for line in file:
      line = line.strip()
      if not line:
        continue

      if line.startswith("[group:"):
        current_group = line[7:-1]
        global_data["groups"][current_group] = {
          "projects_dir": [],
          "specific_projects": {},
          "remove_rules": []
        }
      elif current_group and line == "}":
        current_group = None
      else:
        target = global_data if current_group is None else global_data["groups"][current_group]

        if line.startswith("--add "):
          full_path = Path(line.split("--add", 1)[1].strip()).expanduser()
          if full_path.is_dir():
            target["projects_dir"].append(full_path)
        elif line.startswith("--addspecific "):
          full_path = Path(line.split("--addspecific", 1)[1].strip()).expanduser()
          if full_path.is_dir():
            project_name = full_path.name
            target["specific_projects"][project_name] = full_path
        elif line.startswith("--remove") and "--from" in line:
          parts = line.split("--remove", 1)[1].split("--from")
          if len(parts) == 2:
            remove_path = Path(parts[0].strip()).expanduser()
            from_path = Path(parts[1].strip()).expanduser()
            target["remove_rules"].append((remove_path, from_path))
  return global_data

def sort_projects_by_mtime(projects):
  def folder_mtime(path):
    try:
      latest_mtime = path.stat().st_mtime
    except FileNotFoundError:
      return 0
    for root, _, files in os.walk(path):
      for f in files:
        try:
          fp = Path(root) / f
          latest_mtime = max(latest_mtime, fp.stat().st_mtime)
        except FileNotFoundError:
          continue
    return latest_mtime
  return dict(sorted(projects.items(), key=lambda i: folder_mtime(i[1]), reverse=True))

def collect_projects(projects_dir, specific_projects, remove_rules):
  all_projects = {}

  for folder in projects_dir:
    for sub in folder.iterdir():
      if sub.is_dir():
        if any(folder == from_p and sub == rem_p for rem_p, from_p in remove_rules):
          continue
        all_projects[sub.name] = sub

  all_projects.update(specific_projects)
  return sort_projects_by_mtime(all_projects)

def collect_group_projects(group):
  return collect_projects(
    group["projects_dir"],
    group["specific_projects"],
    group["remove_rules"]
  )

config = parse_config()

def print_groups():
  for group_name, group_data in config["groups"].items():
    print(f"Group: {group_name}")
    for proj in collect_group_projects(group_data):
      print(f"  - {proj}")

def print_group(name):
  for proj in collect_group_projects(config["groups"][name]):
    print(proj)

def print_proj():
  projects = collect_projects(
    config["projects_dir"],
    config["specific_projects"],
    config["remove_rules"]
  )
  for proj in projects:
    print(proj)