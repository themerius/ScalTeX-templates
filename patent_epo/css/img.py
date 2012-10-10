
def gen(lines):
    ret = ""
    for l in range(lines):
        ret += "img.lines-" + str(l) + "{\n"
        ret += "    height: " + str(l * 12) + "pt;\n"
        ret += "}\n\n"
    return ret

if __name__ == "__main__":
    print gen(58)
